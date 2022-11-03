import {ChainId, ChainStage} from '@layerzerolabs/lz-sdk'
import {getConfig as MainnetConfig} from './mainnet'
import {getConfig as TestnetConfig} from './testnet'
import {OFTConfig} from "./common";

export * from './common'

export function LzConfig(stage: ChainStage, chainIds: ChainId[]): OFTConfig {
    switch (stage) {
        case ChainStage.MAINNET:
            return MainnetConfig(chainIds)
        case ChainStage.TESTNET:
            return TestnetConfig(chainIds)
        default:
            throw new Error(`Invalid stage: ${stage}`)
    }
}
