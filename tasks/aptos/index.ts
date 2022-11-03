import path from "path";
import * as commander from 'commander'
import {getAccount, KeyType} from "../../../layerzero-aptos/sdk/cmd/common/utils";
import {wireAll} from "./wireAll";
import {LzConfig, NETWORK_NAME} from "./config";
import { CHAIN_STAGE, ChainKey, ChainStage } from '@layerzerolabs/core-sdk'
import { CHAIN_ID } from '@layerzerolabs/core-sdk'
import * as options from './options'


const program = new commander.Command()
program.name('aptos-manager').version('0.0.1').description('aptos deploy and config manager')

program
    .command('wireAll')
    .description('wire all')
    .addOption(options.OPTION_PROMPT)
    .addOption(options.OPTION_TO_NETWORKS)
    .addOption(options.OPTION_ENV)
    .addOption(options.OPTION_STAGE)
    .addOption(options.OPTION_KEY_PATH)
    .action(async (options) => {
        const toNetworks = options.toNetworks
        validateStageOfNetworks(options.stage, toNetworks)
        const network = NETWORK_NAME[options.stage]
        const lookupIds = toNetworks.map((network) => CHAIN_ID[network.replace('-fork', '')])
        const lzConfig = LzConfig(options.stage, lookupIds)

        const basePath = path.join(options.keyPath, `stage_${options.stage}`)
        const accounts = {
            oft: getAccountFromFile(path.join(basePath, 'oft.json')), //todo: (caleb) change key, must match BRIDGE_ADDRESS
        }

        await wireAll(options.stage, options.env, network, toNetworks, options.prompt, accounts, lzConfig)
    })


export function getAccountFromFile(file: string) {
    return getAccount(file, KeyType.JSON_FILE)
}

export function validateStageOfNetworks(stage: ChainStage, toNetworks: string[]) {
    const networks = getNetworkForStage(stage)
    toNetworks.forEach((network) => {
        if (!networks.includes(network)) {
            throw new Error(`Invalid network: ${network} for stage: ${stage}`)
        }
    })
}

function getNetworkForStage(stage: ChainStage) {
    const networks: string[] = []
    for (const keyType in ChainKey) {
        const key = ChainKey[keyType as keyof typeof ChainKey]
        if (CHAIN_STAGE[key] === stage) {
            networks.push(key)
        }
    }
    return networks
}