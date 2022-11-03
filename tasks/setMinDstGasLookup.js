const CHAIN_IDS = require("../constants/chainIds.json")

module.exports = async function (taskArgs, hre) {
    const dstChainId = CHAIN_IDS[taskArgs.targetNetwork] //10108
    let contract = await ethers.getContract(taskArgs.contract)

    try {
        let tx = await contract.setMinDstGas(dstChainId, 0, 100000)
        console.log(`✅ [${hre.network.name}] setMinDstGasLookup()`)
    } catch (e) {
        console.log(e)
    }
}
