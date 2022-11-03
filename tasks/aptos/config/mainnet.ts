import {modules} from '@layerzerolabs/lz-aptos'
import {CHAIN_KEY, ChainId} from '@layerzerolabs/lz-sdk'
import {applyArbitrumMultiplier, EVM_ADDERSS_SIZE, evmOFTAddresses, OFTConfig} from "./common";

export const OFT_CONFIG: OFTConfig = {
    oftType: "",
    address: "",
    enableCustomAdapterParams: true,
    remoteOft: {},
    minDstGas: {
        [modules.oft.PacketType.SEND]: {},
    },
}

export function getConfig(chainIds: ChainId[]): OFTConfig {
    for (const chainId of chainIds) {
        // fill oft config
        OFT_CONFIG.remoteOft[chainId] = {}
        OFT_CONFIG.remoteOft[chainId].address = evmOFTAddresses(CHAIN_KEY[chainId])
        OFT_CONFIG.remoteOft[chainId].addressSize = EVM_ADDERSS_SIZE
        OFT_CONFIG.minDstGas[modules.oft.PacketType.SEND][chainId] = applyArbitrumMultiplier(chainId, 150000)
    }
    return OFT_CONFIG
}