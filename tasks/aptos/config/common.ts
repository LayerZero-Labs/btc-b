import { ChainId, ChainStage } from '@layerzerolabs/lz-sdk'
const { getDeploymentAddresses } = require("../../../utils/readStatic")

export type OFTConfig = {
    oftType: string
    address: string
    enableCustomAdapterParams: boolean
    // todo: default fee?
    remoteOft: any
    minDstGas: any
    defaultFeeBp: any
}

export const NETWORK_NAME: { [c in ChainStage]?: string } = {
    [ChainStage.MAINNET]: 'aptos',
    [ChainStage.TESTNET]: 'aptos-testnet',
    [ChainStage.TESTNET_SANDBOX]: 'aptos-testnet-sandbox',
}

export const EVM_ADDERSS_SIZE = 20

export const ARBITRUM_MULTIPLIER = 10
export function applyArbitrumMultiplier(chainId: ChainId, value: number) {
    return [ChainId.ARBITRUM_GOERLI, ChainId.ARBITRUM].includes(chainId)
        ? value * ARBITRUM_MULTIPLIER
        : value
}

const oftAddresses: { [key: string]: string } = {}

export function evmOFTAddresses(network: string): string {
    const key = `${network}}`
    if (!oftAddresses[key]) {
        let addresses = getDeploymentAddresses(network)
        if (addresses['OFT'] === undefined) {
            oftAddresses[key] = addresses["ProxyOFT"]
        } else {
            oftAddresses[key] = addresses["OFT"]
        }
    }
    return oftAddresses[key]
}