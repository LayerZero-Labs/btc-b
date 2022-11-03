import * as commander from 'commander'
import {types} from '@layerzerolabs/lz-aptos'
import { ChainStage } from '@layerzerolabs/core-sdk'

export const OPTION_PROMPT = new commander.Option('-p, --prompt <prompt>', 'prompt for confirmation').default(true)

export const OPTION_ENV = new commander.Option('-e, --env <env>', 'aptos chain environment')
    .default(types.Environment.LOCAL)
    .choices([types.Environment.LOCAL, types.Environment.DEVNET, types.Environment.TESTNET, types.Environment.MAINNET])

export const OPTION_STAGE = new commander.Option('-s, --stage <stage>', 'stage for lookup and configurations')
    .makeOptionMandatory(true)
    .choices(['sandbox', 'testnet', 'mainnet'])
    .argParser(function getChainStage(stage: string) {
        switch (stage) {
            case 'sandbox':
                return ChainStage.TESTNET_SANDBOX
            case 'testnet':
                return ChainStage.TESTNET
            case 'mainnet':
                return ChainStage.MAINNET
            default:
                throw new Error(`Invalid stage: ${stage}`)
        }
    })

export const OPTION_TO_NETWORKS = new commander.Option('-t, --to-networks <to-networks>', 'to networks')
    .makeOptionMandatory(true)
    .argParser(function commaSeparatedList(value: string, prev: string[]): string[] {
        return value.split(',')
    })

export const OPTION_KEY_PATH = new commander.Option('-k, --key-path <key-path>', 'keypair base path').default(
    '~/.config/aptos'
)
