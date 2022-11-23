import * as ethers from "ethers"
import { getDeploymentAddresses, getLayerzeroCoreDeployments, getRpc } from "./readStatic"
import {CHAIN_ID, ChainKey} from "@layerzerolabs/lz-sdk"
import { cli } from "cli-ux"
import { ContractReceipt } from "ethers"
import { createProvider } from "hardhat/internal/core/providers/construction"
import { DeploymentsManager } from "hardhat-deploy/dist/src/DeploymentsManager"
import EthersAdapter from "@gnosis.pm/safe-ethers-lib"
import SafeServiceClient from "@gnosis.pm/safe-service-client"
import Safe, { SafeTransactionOptionalProps } from "@gnosis.pm/safe-core-sdk"
import invariant from "tiny-invariant"

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });

export function getEndpointId(networkName: string): number {
    return CHAIN_ID[networkName]
}

export interface ExecutableTransaction {
    contractName: string
    methodName: string
    args: any[]
    txArgs?: any
}

export interface Transaction {
    needChange: boolean
    contractName: string
    calldata: string
    methodName: string
    args: any[]
    chainId: string
    remoteChainId?: string
    diff?: { [key: string]: { newValue: any; oldValue: any } }
}

const getDeploymentManager = (hre, networkName): any => {
    const network: any = {
        name: networkName,
        config: hre.config.networks[networkName],
        provider: createProvider(networkName, hre.config.networks[networkName], hre.config.paths, hre.artifacts),
        saveDeployments: true,
    }
    const newHre = Object.assign(Object.create(Object.getPrototypeOf(hre)), hre)
    newHre.network = network
    const deploymentsManager = new DeploymentsManager(newHre, network)
    newHre.deployments = deploymentsManager.deploymentsExtension
    newHre.getNamedAccounts = deploymentsManager.getNamedAccounts.bind(deploymentsManager)
    newHre.getUnnamedAccounts = deploymentsManager.getUnnamedAccounts.bind(deploymentsManager)
    newHre.getChainId = () => {
        return deploymentsManager.getChainId()
    }
    return deploymentsManager
}

export const deployContract = async (hre: any, network: string, tags: string[]) => {
    const deploymentsManager = getDeploymentManager(hre, network)
    // console.log("hre.network.name")
    // console.log(deploymentsManager.network.name)
    await deploymentsManager.runDeploy(tags, {
        log: false, //args.log,
        resetMemory: false,
        writeDeploymentsToFiles: true,
        savePendingTx: false,
    })
}

const providerByNetwork: { [name: string]: ethers.providers.JsonRpcProvider } = {}
export const getProvider = (network: string) => {
    if (!providerByNetwork[network]) {
        let networkUrl = getRpc(network)
        providerByNetwork[network] = new ethers.providers.JsonRpcProvider(networkUrl)
    }
    return providerByNetwork[network]
}

export const getWallet = (index) => {
    return ethers.Wallet.fromMnemonic(process.env.MNEMONIC || "", `m/44'/60'/0'/0/${index}`)
}

const connectedWallets = {}
export const getConnectedWallet = (network, walletIndex) => {
    const key = `${network}-${walletIndex}`
    if (!connectedWallets[key]) {
        const provider = getProvider(network)
        const wallet = getWallet(walletIndex)
        connectedWallets[key] = wallet.connect(provider)
    }
    return connectedWallets[key]
}

const deploymentAddresses: { [key: string]: string } = {}
export const getDeploymentAddress = (network: string, contractName: string) => {
    const key = `${network}-${contractName}`
    if (!deploymentAddresses[key]) {
        deploymentAddresses[key] = getDeploymentAddresses(network)[contractName]
    }
    if (!deploymentAddresses[key]) {
        deploymentAddresses[key] = getLayerzeroCoreDeployments(network)[contractName]
    }
    if (!deploymentAddresses[key]) {
        throw Error(`contract ${key} not found for network: ${network}`)
    }
    return deploymentAddresses[key]
}

const contracts: { [key: string]: any } = {}
export const getContract = async (hre: any, network: string, contractName: string) => {
    if (network == "hardhat") {
        return await hre.ethers.getContract(contractName)
    }

    const key = `${network}-${contractName}`
    if (!contracts[key]) {
        const contractAddress = getDeploymentAddress(network, contractName)
        // console.log(`contractAddress[${contractAddress}] for ${network} - ${contractName}`)
        const provider = getProvider(network)
        const contractFactory = await getContractFactory(hre, contractName)
        const contract = contractFactory.attach(contractAddress)
        contracts[key] = contract.connect(provider)
    }
    return contracts[key]
}

export const getWalletContract = async (hre, network, contractName, walletIndex) => {
    const contract = await getContract(hre, network, contractName)
    const wallet = getConnectedWallet(network, walletIndex)
    return contract.connect(wallet)
}

const contractFactories: { [name: string]: ethers.ContractFactory } = {}
const getContractFactory = async (hre: any, contractName: string) => {
    if (!contractFactories[contractName]) {
        // const artifacts = await hre.artifacts.readArtifactSync(contractName)
        // contractFactories[contractName] = new ethers.ContractFactory(artifacts.abi, artifacts.bytecode)
        contractFactories[contractName] = await hre.ethers.getContractFactory(contractName)
    }
    return contractFactories[contractName]
}

export async function promptToProceed(msg: string, noPrompt: boolean = false) {
    if (!noPrompt) {
        const proceed = await cli.prompt(`${msg} y/N`)
        if (!["y", "yes"].includes(proceed.toLowerCase())) {
            console.log("Aborting...")
            process.exit(0)
        }
    }
}

export const executeTransaction = async (
    hre: any,
    network: string,
    transaction: ExecutableTransaction
): Promise<ContractReceipt> => {
    const walletContract = await getWalletContract(hre, network, transaction.contractName, 0)
    const gasPrice = await getProvider(network).getGasPrice()
    const finalGasPrice = gasPrice.mul(10).div(8)
    // const finalGasPrice = gasPrice.mul(2)
    // const receipt: TransactionReceipt = await (await walletContract[transaction.methodName](...transaction.args, {gasPrice: finalGasPrice})).wait()
    // const receipt: TransactionReceipt = await (await walletContract[transaction.methodName](...transaction.args, { gasLimit: 8000000 })).wait()
    return await (
        await walletContract[transaction.methodName](...transaction.args, {
            gasPrice: finalGasPrice,
            gasLimit: 8000000,
            ...transaction.txArgs,
        })
    ).wait()
}

export const executeGnosisTransactions = async (hre: any, network: string, transactions: Transaction[]) => {
    // transactions = [transactions[0]]
    // const signer = await getWalletFromPk(network)
    const signer = await getConnectedWallet(network, 0)
    const ethAdapter = new EthersAdapter({
        ethers: hre.ethers,
        signer,
    })

    invariant(GNOSIS_CONFIG[network], `Gnosis for ${network} not supported.`)

    const { safeAddress, url } = GNOSIS_CONFIG[network]

    const safeService = new SafeServiceClient(url)
    const safeSdk: Safe = await Safe.create({ ethAdapter, safeAddress })

    const gnosisTransactions = transactions.map((tx) => {
        const contractAddress = getDeploymentAddress(network, tx.contractName)
        return {
            to: contractAddress,
            data: tx.calldata,
            value: "0",
        }
    })

    const nonce = await safeService.getNextNonce(safeAddress)
    const options: SafeTransactionOptionalProps = {
        nonce,
    }
    const safeTransaction = await safeSdk.createTransaction(gnosisTransactions, options)

    await safeSdk.signTransaction(safeTransaction)
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
    await safeService.proposeTransaction({
        safeAddress,
        safeTransaction,
        safeTxHash,
        senderAddress: signer.address,
    })
}


export const GNOSIS_CONFIG = {
    [ChainKey.ETHEREUM]: {
        safeAddress: "0xa36B7e7894aCfaa6c35A8A0EC630B71A6B8A6D22",
        url: "https://safe-transaction.mainnet.gnosis.io/",
    },
    [ChainKey.BSC]: {
        safeAddress: "0x4755D44c1C196dC524848200B0556A09084D1dFD",
        url: "https://safe-transaction.bsc.gnosis.io/",
    },
    [ChainKey.AVALANCHE]: {
        safeAddress: "0x4FF2C33FD9042a76eaC920C037383E51659417Ee",
        url: "https://safe-transaction.avalanche.gnosis.io/",
    },
    [ChainKey.POLYGON]: {
        safeAddress: "0x1eF2691ada0E282E6ba31DcAD10F7C0Bc9E96b1f",
        url: "https://safe-transaction.polygon.gnosis.io/",
    },
    [ChainKey.ARBITRUM]: {
        safeAddress: "0x873F403411B0Dac132e8Af4D93308Df70a030c86",
        url: "https://safe-transaction.arbitrum.gnosis.io",
    },
    [ChainKey.OPTIMISM]: {
        safeAddress: "0x1E1817928dA8c4329CCd3354C0565d0486888D29",
        url: "https://safe-transaction.optimism.gnosis.io/",
    }
}
