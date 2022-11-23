const LZ_ENDPOINTS = require("../constants/layerzeroEndpoints.json")
const {CHAIN_STAGE, ChainStage, ChainKey} = require("@layerzerolabs/lz-sdk");

const NETWORKS = [ChainKey.AVALANCHE, ChainKey.FUJI, ChainKey.FUJI_SANDBOX, "hardhat"]
const BTCB = {
    [ChainStage.MAINNET]: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
}

module.exports = async function ({ deployments, getNamedAccounts }) {
    if(!NETWORKS.includes(hre.network.name)) {
        throw new Error(`Can only deploy ProxyOFT on ${NETWORKS}`)
    }

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(`>>> your address: ${deployer}`)

    const lzEndpointAddress = LZ_ENDPOINTS[hre.network.name]
    console.log(`[${hre.network.name}] Endpoint Address: ${lzEndpointAddress}`)

    const stage = CHAIN_STAGE[hre.network.name]
    let tokenAddress = BTCB[stage] || (await deployments.get("Token")).address
    console.log(`Token Address: ${tokenAddress}`)

    await deploy("BTCbProxyOFT", {
        from: deployer,
        args: [tokenAddress, lzEndpointAddress],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true
    })
}

function getDependencies() {
    if (hre.network.name === "hardhat" || CHAIN_STAGE[hre.network.name] === ChainStage.TESTNET || CHAIN_STAGE[hre.network.name] === ChainStage.TESTNET_SANDBOX) {
        return ["Token"]
    }
}
module.exports.dependencies = getDependencies()
module.exports.tags = ["BTCbProxyOFT"]