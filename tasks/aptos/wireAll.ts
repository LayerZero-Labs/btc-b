import * as aptos from 'aptos'
import {SDK, utils, constants, types} from '@layerzerolabs/lz-aptos'
import * as oft from '@layerzerolabs/lz-aptos/dist/modules/apps/oft'
import {ChainStage, CHAIN_ID} from '@layerzerolabs/lz-sdk'
import {promises as fs} from "fs";
import {cli} from 'cli-ux'
import {OFTConfig} from "./config";

export async function wireAll(
    _stage: ChainStage,
    _env: types.Environment,
    _network: string,
    _toNetworks: string[],
    prompt: boolean,
    accounts: { [key: string]: aptos.AptosAccount },
    config: OFTConfig
) {
    const endpointId = CHAIN_ID[_network]
    console.log({
        stage: ChainStage[_stage],
        env: _env,
        network: _network,
        endpointId: endpointId,
        toNetworks: _toNetworks,
    })
    const sdk = new SDK({
        provider: new aptos.AptosClient(constants.NODE_URL[_env]),
        stage: _stage,
    })

    if (_env === types.Environment.LOCAL) {
        const faucet = new aptos.FaucetClient(constants.NODE_URL[_env], constants.FAUCET_URL[_env])
        for (const accountName in accounts) {
            const address = accounts[accountName].address()
            await faucet.fundAccount(address, 1000000000)
        }
    }

    //check if all required accounts exist
    for (const accountName in accounts) {
        const address = accounts[accountName].address()
        try {
            await sdk.client.getAccount(address)
        } catch (e) {
            if (utils.isErrorOfApiError(e, 404)) {
                console.log(`Account ${accountName}(${address}) not exists`)
                return
            }
            throw e
        }
    }

    const txns: Transaction[] = await configureOFT(sdk, endpointId, config)
    for (const remoteNetwork of _toNetworks) {
        const [lookupId, remoteId] = getEndpointId(remoteNetwork)
        txns.push(...(await configureOFTWithRemote(sdk, endpointId, lookupId, remoteId, config)))
    }

    const transactionByModule = [
        {
            accountName: 'oft',
            account: accounts.oft,
            txns: txns,
        },
    ]

    let needChange = false
    transactionByModule.forEach(({accountName, txns}) => {
        console.log(`************************************************`)
        console.log(`Transaction for ${accountName}`)
        console.log(`************************************************`)
        const txnNeedChange = txns.filter((tx) => tx.needChange)
        if (!txnNeedChange.length) {
            console.log('No change needed')
        } else {
            needChange = true
            console.table(txnNeedChange)
        }
    })

    const columns = ['needChange', 'chainId', 'remoteChainId', 'module', 'function', 'args', 'diff', 'payload']
    const data = transactionByModule.reduce((acc: any[], {accountName, txns}) => {
        txns.forEach((transaction) => {
            acc.push([
                accountName,
                ...columns.map((key) => {
                    if (typeof transaction[key] === 'object') {
                        return JSON.stringify(transaction[key])
                    } else {
                        return transaction[key]
                    }
                }),
            ])
        })
        return acc
    }, [])
    await fs.writeFile('./transactions.csv', arrayToCsv(['accountName'].concat(columns), data))

    console.log(`Full configuration written to: ${process.cwd()}/transactions.csv`)
    if (!needChange) {
        return
    }

    await promptToProceed('Would you like to proceed with above instruction?', prompt)

    const errs: any[] = []
    const print: any = {}
    let previousPrintLine = 0
    const printResult = () => {
        if (previousPrintLine) {
            process.stdout.moveCursor(0, -previousPrintLine)
        }
        if (Object.keys(print)) {
            previousPrintLine = Object.keys(print).length + 4
            console.table(Object.keys(print).map((account) => ({account, ...print[account]})))
        }
    }
    await Promise.all(
        transactionByModule.map(async ({accountName, account, txns}) => {
            const txnsToSend = txns.filter((tx) => tx.needChange)
            let successTx = 0
            print[accountName] = print[accountName] || {requests: `${successTx}/${txnsToSend.length}`}
            for (const txn of txnsToSend) {
                print[accountName].current = `${txn.module}.${txn.function}`
                printResult()
                try {
                    const tx = await sdk.sendAndConfirmTransaction(account, txn.payload)
                    print[accountName].past = tx.hash
                    successTx++
                    print[accountName].requests = `${successTx}/${txnsToSend.length}`
                    printResult()
                } catch (e) {
                    console.log(`Failing calling ${txn.module}::${txn.function} for ${accountName} with err ${e}`)
                    console.log(e)
                    errs.push({
                        accountName,
                        e,
                    })
                    print[accountName].current = e
                    print[accountName].err = true
                    printResult()
                    break
                }
            }
        })
    )
    if (!errs.length) {
        console.log('Wired all accounts successfully')
    } else {
        console.log(errs)
    }
}

export async function configureOFT(sdk: SDK, endpointId: number, config: OFTConfig): Promise<Transaction[]> {
    const transactions: Transaction[] = []
    const oftModule = new oft.OFT(sdk)
    transactions.push(...(await enableCustomAdapterParamsOft(oftModule, endpointId, config)))
    transactions.push(...(await configureDefaultFeeBp(oftModule, endpointId, config)))
    return transactions
}

export async function configureOFTWithRemote(
    sdk: SDK,
    endpointId: number,
    lookupId: number,
    remoteId: number,
    config: OFTConfig
): Promise<Transaction[]> {
    const transactions: Transaction[] = []
    const oftModule = new oft.OFT(sdk)
    transactions.push(...(await setRemoteOft(oftModule, endpointId, lookupId, remoteId, config)))
    transactions.push(...(await setMinDstGasOft(oftModule, endpointId, lookupId, remoteId, config)))
    return transactions
}

export async function configureDefaultFeeBp(oftSdk: oft.OFT, endpointId, config,) {
    const oftType = config.oftType
    const current = await oftSdk.getDefaultFee(oftType)
    const needChange = current !== config.defaultFeeBp.toString()

    const payload = oftSdk.payloadOfSetDefaultFee(oftType, config.defaultFeeBp)
    const moduleName = payload.function.split('::')[1]

    const tx: Transaction = {
        needChange,
        chainId: endpointId,
        module: moduleName,
        function: payload.function.split('::')[2],
        args: payload.arguments,
        payload,
    }
    if (tx.needChange) {
        tx.diff = {
            enabled: {
                oldValue: current,
                newValue: config.defaultFeeBp,
            },
        }
    }
    return [tx]
}

async function setRemoteOft(oftSdk: oft.OFT, endpointId, lookupId, remoteId, config: OFTConfig): Promise<Transaction[]> {
    const oftType = config.oftType
    const curBuffer = await oftSdk.getRemote(oftType, remoteId)
    const cur = '0x' + Buffer.from(curBuffer).toString('hex')
    const remoteOft = config.remoteOft[lookupId]
    const needChange = cur.toLowerCase() !== remoteOft.address.toLowerCase()

    const payload = oftSdk.setRemotePayload(
        oftType,
        remoteId,
        utils.convertToPaddedUint8Array(remoteOft.address, remoteOft.addressSize)
    )
    const moduleName = payload.function.split('::')[1]
    const tx: Transaction = {
        needChange,
        chainId: endpointId,
        remoteChainId: remoteId,
        module: moduleName,
        function: payload.function.split('::')[2],
        args: payload.arguments,
        payload,
    }
    if (tx.needChange) {
        tx.diff = {
            remote: {
                oldValue: cur,
                newValue: remoteOft.address,
            },
        }
    }
    return [tx]
}

async function setMinDstGasOft(oftSdk: oft.OFT, endpointId, lookupId, remoteId, config): Promise<Transaction[]> {
    const oftType = config.oftType
    const cur = await oftSdk.getMinDstGas(oftType, remoteId, BigInt(oft.PacketType.SEND))
    const minDstGas = config.minDstGas[oft.PacketType.SEND][lookupId]
    const needChange = cur.toString() !== minDstGas.toString()
    const payload = oftSdk.setMinDstGasPayload(oftType, remoteId, BigInt(oft.PacketType.SEND), minDstGas)
    const moduleName = payload.function.split('::')[1]
    const tx: Transaction = {
        needChange,
        chainId: endpointId,
        remoteChainId: remoteId,
        module: moduleName,
        function: payload.function.split('::')[2],
        args: payload.arguments,
        payload,
    }
    if (tx.needChange) {
        tx.diff = {
            gas: {
                oldValue: cur.toString(),
                newValue: minDstGas.toString(),
            },
        }
    }
    return [tx]
}

async function enableCustomAdapterParamsOft(oftSdk: oft.OFT, endpointId, config): Promise<Transaction[]> {
    const oftType = config.oftType
    const enabled = await oftSdk.customAdapterParamsEnabled(oftType)
    const needChange = enabled !== config.enableCustomAdapterParams

    const payload = oftSdk.enableCustomAdapterParamsPayload(oftType, config.enableCustomAdapterParams)
    const moduleName = payload.function.split('::')[1]
    const tx: Transaction = {
        needChange,
        chainId: endpointId,
        module: moduleName,
        function: payload.function.split('::')[2],
        args: payload.arguments,
        payload,
    }
    if (tx.needChange) {
        tx.diff = {
            enabled: {
                oldValue: enabled,
                newValue: config.enableCustomAdapterParams,
            },
        }
    }
    return [tx]
}

function getEndpointId(remoteNetwork: string): [number, number] {
    const lookupId = CHAIN_ID[remoteNetwork]
    const remoteId = lookupId
    return [lookupId, remoteId]
}

async function promptToProceed(msg: string, prompt: boolean = true) {
    if (prompt) {
        const proceed = await cli.prompt(`${msg} y/N`)
        if (!['y', 'yes'].includes(proceed.toLowerCase())) {
            console.log('Aborting...')
            process.exit(0)
        }
    }
}

function arrayToCsv(columns, data) {
    return columns
        .join(',')
        .concat('\n')
        .concat(
            data
                .map(
                    (row) =>
                        row
                            .map(String) // convert every value to String
                            .map((v) => (v === 'undefined' ? '' : v))
                            .map((v) => v.replace(/\"/g, '""')) // escape double colons
                            .map((v) => `"${v}"`) // quote it
                            .join(',') // comma-separated
                )
                .join('\r\n') // rows starting on new lines)
        )
}

export interface Transaction {
    needChange: boolean
    chainId: string
    remoteChainId?: string
    module: string
    function: string
    args: string[]
    payload: aptos.Types.EntryFunctionPayload
    diff?: { [key: string]: { newValue: any; oldValue: any } }
}