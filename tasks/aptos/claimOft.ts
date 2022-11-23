import * as aptos from 'aptos'
import {SDK, constants, types} from '@layerzerolabs/lz-aptos'
import {ChainStage} from '@layerzerolabs/lz-sdk'
import {OFT} from "@layerzerolabs/lz-aptos/dist/modules/apps/oft";
import {OFT_CONFIG} from "./config/testnet";


export async function claimOft(
    _stage: ChainStage,
    _env: types.Environment,
    accounts: { [key: string]: aptos.AptosAccount },
    addressClaim: string
) {
    console.log({
        stage: ChainStage[_stage],
        env: _env,
    })
    const sdk = new SDK({
        provider: new aptos.AptosClient(constants.NODE_URL[_env]),
        stage: _stage,
    })

    let oftModule = new OFT(sdk);
    let oftType = OFT_CONFIG["oftType"];
    let claimableAmt = await oftModule.getClaimableCoin(oftType, addressClaim)
    console.log(`Claimable Amount Before: ${claimableAmt}`)
    await oftModule.claimCoin(accounts.account, oftType)
    const balance = await oftModule.balance(oftType, addressClaim)
    console.log(`balance: ${balance}`)
    claimableAmt = await oftModule.getClaimableCoin(oftType, addressClaim)
    console.log(`Claimable Amount After: ${claimableAmt}`)
}
