const CHAIN_ID = require("../constants/chainIds.json")
const { getDeploymentAddresses } = require("../utils/readStatic")

module.exports = async function (taskArgs, hre) {
    let localContract = taskArgs.contract;

    // get local contract
    const localContractInstance = await ethers.getContract(localContract)

    // get deployed remote contract address
    const remoteAddress = "0x8ffe1b36292a1ea7c2ad006be4f380c897b141681ab1d28bbc5dce179774fa99"

    // get remote chain id
    const remoteChainId = 10108

    try {
        let tx = await (await localContractInstance.setTrustedRemoteAddress(remoteChainId, remoteAddress)).wait()
        console.log(`✅ [${hre.network.name}] setTrustedRemoteAddress(${remoteChainId}, ${remoteAddress})`)
        console.log(` tx: ${tx.transactionHash}`)
    } catch (e) {
        if (e.error.message.includes("The chainId + address is already trusted")) {
            console.log("*source already set*")
        } else {
            console.log(`❌ [${hre.network.name}] setTrustedRemote(${remoteChainId}, ${remoteAndLocal})`)
        }
    }
}
