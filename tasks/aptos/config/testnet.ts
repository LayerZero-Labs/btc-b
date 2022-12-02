import * as oft from '@layerzerolabs/lz-aptos/dist/modules/apps/oft'
import {CHAIN_KEY, ChainId} from '@layerzerolabs/lz-sdk'
import {applyArbitrumMultiplier, EVM_ADDERSS_SIZE, evmOFTAddresses, OFTConfig} from "./common"

export const OFT_CONFIG: OFTConfig = {
    oftType: "0x32dc19ea987e86e024241843b90e6aa91d04d05f868d8ecb691fa5ce26a5b2b6::oft::BTCbOFT",
    address: "0x32dc19ea987e86e024241843b90e6aa91d04d05f868d8ecb691fa5ce26a5b2b6",
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