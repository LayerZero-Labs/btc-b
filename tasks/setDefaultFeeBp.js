const CHAIN_IDS = require("../constants/chainIds.json")

module.exports = async function (taskArgs, hre) {
    let contract = await ethers.getContract(taskArgs.contract)

    try {
        let tx = await contract.setDefaultFeeBp(taskArgs.fee)
        console.log(`✅ [${hre.network.name}] setDefaultFeeBp(${taskArgs.fee})`)
    } catch (e) {
        console.log(e)
    }
}
