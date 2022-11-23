import * as aptos from 'aptos'
import {SDK, utils, constants, types} from '@layerzerolabs/lz-aptos'
import {ChainStage, CHAIN_ID} from '@layerzerolabs/lz-sdk'
import {promises as fs} from "fs";
import {cli} from 'cli-ux'
import {OFTConfig} from "./config";
import {OFT} from "@layerzerolabs/lz-aptos/dist/modules/apps/oft";
import {BigNumber} from "ethers";
import {OFT_CONFIG} from "./config/testnet";
import {convertToPaddedUint8Array} from "@layerzerolabs/lz-aptos/dist/utils";


export async function sendOft(
    _stage: ChainStage,
    _env: types.Environment,
    _network: string,
    _toNetworks: string[],
    accounts: { [key: string]: aptos.AptosAccount },
    oftDeployedAddress: string,
    remoteChainId: number,
    qtyLd: number,
    evmAddress: string
) {
    const endpointId = CHAIN_ID[_network]
    console.log({
        stage: ChainStage[_stage],
        env: _env,
        network: _network,
        endpointId: endpointId,
        toNetworks: _toNetworks,
        remoteChainId: remoteChainId
    })
    const sdk = new SDK({
        provider: new aptos.AptosClient(constants.NODE_URL[_env]),
        stage: _stage,
    })

    let oftModule = new OFT(sdk);

    const adapterParams = sdk.LayerzeroModule.Executor.buildDefaultAdapterParams(200000) //minDstGas
    const option = new Uint8Array(0)

    const fee = await sdk.LayerzeroModule.Endpoint.quoteFee(
        oftDeployedAddress,
        remoteChainId,
        adapterParams,
        oftModule.SEND_PAYLOAD_LENGTH
    )

    let oftType = OFT_CONFIG["oftType"];
    const remoteReceiverBytes = convertToPaddedUint8Array(evmAddress, 32);

    try {
        const txn = await oftModule.sendCoin(
            accounts.account,
            oftType,
            remoteChainId,
            remoteReceiverBytes,
            qtyLd,
            Math.floor(qtyLd * 0.8),
            fee,
            0,
            adapterParams,
            option
        )
        console.log({txn});
    } catch (e) {
        console.log({e});
    }

}
