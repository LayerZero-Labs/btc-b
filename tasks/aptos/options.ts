import * as commander from 'commander'
import {types} from '@layerzerolabs/lz-aptos'
import { ChainStage } from '@layerzerolabs/lz-sdk'

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
                return [ChainStage.TESTNET_SANDBOX, stage]
            case 'testnet':
                return [ChainStage.TESTNET, stage]
            case 'mainnet':
                return [ChainStage.MAINNET, stage]
            default:
                throw new Error(`Invalid stage: ${stage}`)
        }
    })

export const OPTION_TO_NETWORKS = new commander.Option('-t, --to-networks <to-networks>', 'to networks')
    .makeOptionMandatory(true)
    .argParser(function commaSeparatedList(value: string, prev: string[]): string[] {
        return value.split(',')
    })

export const OPTION_DST_CHAIN_ID = new commander.Option('-d, --dst-chain-id <dst-chain-id>', 'dst chain id').makeOptionMandatory(true)

export const OPTION_QTY_LD = new commander.Option('-q, --qty-ld <qty-ld>', 'qty local decimals').makeOptionMandatory(true)

export const OPTION_EVM_ADDRESS = new commander.Option('-ea, --evm-address <evm-address>', 'evm address to send to').makeOptionMandatory(true)

export const OPTION_ADDRESS_CLAIM = new commander.Option('-a, --address-claim <address-claim>', 'aptos address to claim token').makeOptionMandatory(true)