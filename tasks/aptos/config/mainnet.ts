import * as oft from '@layerzerolabs/lz-aptos/dist/modules/apps/oft'
import {CHAIN_KEY, ChainId} from '@layerzerolabs/lz-sdk'
import {applyArbitrumMultiplier, EVM_ADDERSS_SIZE, evmOFTAddresses, OFTConfig} from "./common";

export const OFT_CONFIG: OFTConfig = {
    oftType: "0x8b107b816356295ea62750020edea701bfc6d11575953d0e146c20d7b9409300::oft::BTCbOFT",
    address: "0x8b107b816356295ea62750020edea701bfc6d11575953d0e146c20d7b9409300",
    enableCustomAdapterParams: true,
    remoteOft: {},
    minDstGas: {
        [oft.PacketType.SEND]: {},
    },
    defaultFeeBp: 0
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