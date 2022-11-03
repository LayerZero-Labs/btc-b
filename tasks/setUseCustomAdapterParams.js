module.exports = async function (taskArgs, hre) {
    let contract = await ethers.getContract(taskArgs.contract)
    try {
        let tx = await contract.setUseCustomAdapterParams(true)
        console.log(`✅ [${hre.network.name}] setUseCustomAdapterParams()`)
        console.log(` tx: ${tx.transactionHash}`)
    } catch (e) {
        console.log(e)
    }
}
