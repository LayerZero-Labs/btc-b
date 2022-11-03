import { ChainId, ChainStage } from '@layerzerolabs/core-sdk'
import {getConfig as MainnetConfig} from './mainnet'
import {OFTConfig} from "./common";

export * from './common'

export function LzConfig(stage: ChainStage, chainIds: ChainId[]): OFTConfig {
    switch (stage) {
        case ChainStage.MAINNET:
            return MainnetConfig(chainIds)
        default:
            throw new Error(`Invalid stage: ${stage}`)
    }
}
