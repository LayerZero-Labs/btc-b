const CHAIN_ID = require("../constants/chainIds.json")
const { getDeploymentAddresses } = require("../utils/readStatic")
const YAML = require("yaml");
const path = require('path');
const fs = require('fs');


module.exports = async function (taskArgs, hre) {
    let localContract = taskArgs.contract;

    // get local contract
    const localContractInstance = await ethers.getContract(localContract)

    const projectRoot = path.join(__dirname, "..")
    const file = fs.readFileSync(path.join(projectRoot, "./aptos/.aptos/config.yaml"), 'utf8')
    const config = YAML.parse(file)

    // get deployed remote contract address
    const remoteAddress = "0x" + config.profiles["testnet"].account;

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
