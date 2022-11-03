import * as commander from 'commander'
import {wireAll} from "./wireAll";
import {LzConfig, NETWORK_NAME} from "./config";
import { CHAIN_STAGE, ChainKey, ChainStage } from '@layerzerolabs/lz-sdk'
import { CHAIN_ID } from '@layerzerolabs/lz-sdk'
import * as options from './options'
import fs from 'fs'
import YAML from 'yaml'
import * as aptos from 'aptos'

const program = new commander.Command()
program.name('aptos-manager').version('0.0.1').description('aptos deploy and config manager')

program
    .command('wireAll')
    .description('wire all')
    .addOption(options.OPTION_PROMPT)
    .addOption(options.OPTION_TO_NETWORKS)
    .addOption(options.OPTION_ENV)
    .addOption(options.OPTION_STAGE)
    .action(async (options) => {
        const toNetworks = options.toNetworks
        const stage: ChainStage = options.stage[0]
        const stageName: string = options.stage[1]
        validateStageOfNetworks(stage, toNetworks)
        const network = NETWORK_NAME[stage]!
        const lookupIds = toNetworks.map((network) => CHAIN_ID[network.replace('-fork', '')])
        const lzConfig = LzConfig(stage, lookupIds)

        const file = fs.readFileSync("../../aptos/.aptos/config.yaml", 'utf8')
        const config = YAML.parse(file)

        const privateKeyString = config.profiles[stageName].private_key
        const privateKeyBytes = Uint8Array.from(Buffer.from(aptos.HexString.ensure(privateKeyString).noPrefix(), 'hex'))
        const oftAccount = new aptos.AptosAccount(privateKeyBytes)

        const accounts = {
            oft: oftAccount,
        }

        await wireAll(stage, options.env, network, toNetworks, options.prompt, accounts, lzConfig)
    })
program.parse()

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