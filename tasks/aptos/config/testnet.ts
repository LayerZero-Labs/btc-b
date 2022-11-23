import * as oft from '@layerzerolabs/lz-aptos/dist/modules/apps/oft'
import {CHAIN_KEY, ChainId} from '@layerzerolabs/lz-sdk'
import {applyArbitrumMultiplier, EVM_ADDERSS_SIZE, evmOFTAddresses, OFTConfig} from "./common"

export const OFT_CONFIG: OFTConfig = {
    oftType: "0x0bf52787bd28d6eef8533e52bc8be27bf0040ad81b8004a88f1c263eee6e1c06::oft::BTCbOFT",
    address: "0x0bf52787bd28d6eef8533e52bc8be27bf0040ad81b8004a88f1c263eee6e1c06",
    enableCustomAdapterParams: true,
    remoteOft: {},
    minDstGas: {
        [oft.PacketType.SEND]: {},
    },
    defaultFeeBp: 10
}

export function getConfig(chainIds: ChainId[]): OFTConfig {
    for (const chainId of chainIds) {
        // fill oft config
        OFT_CONFIG.remoteOft[chainId] = {}
        OFT_CONFIG.remoteOft[chainId].address = evmOFTAddresses(CHAIN_KEY[chainId])
        OFT_CONFIG.remoteOft[chainId].addressSize = EVM_ADDERSS_SIZE
        OFT_CONFIG.minDstGas[oft.PacketType.SEND][chainId] = applyArbitrumMultiplier(chainId, 150000)
    }
    return OFT_CONFIG
}