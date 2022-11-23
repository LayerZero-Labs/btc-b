const { cli } = require("cli-ux")
const MULTISIGS = require("../constants/multisig.json")

async function promptToProceed(msg) {
    const proceed = await cli.prompt(`${msg} y/N`)
    return ["y", "yes"].includes(proceed.toLowerCase())
}

module.exports = async function (taskArgs, hre) {
    let signers = await ethers.getSigners()
    console.log(`current local signer/deployer: ${signers[0].address}`)

    let block = await ethers.provider.getBlock()
    console.log(`[${hre.network.name}] currentBlock: ${JSON.stringify(block.hash)}`)
    console.log(`[${hre.network.name}] currentBlock: ${JSON.stringify(block.number)}`)

    let multisigAddress = MULTISIGS[hre.network.name]
    console.log(`[${hre.network.name}] multisigAddress: ${multisigAddress}`)

    let codeAt = await ethers.provider.getCode(multisigAddress)
    console.log(codeAt)
    await promptToProceed(`**** On >> ${hre.network.name} << is there code at the address?`)

    let oft;
    if(['avalanche'].includes(hre.network.name)){
        oft = await ethers.getContract("BTCbProxyOFT")
    } else {
        oft = await ethers.getContract("BTCbOFT")
    }

    let oftOwner = await oft.owner()
    console.log(`oftOwner: ${oftOwner}`)


    await promptToProceed(
        `**** On >> ${hre.network.name} << This will transferOwnership() of ALL Ownable contracts to >> ${multisigAddress} << Are you SURE you want to proceed?`
    )

    let tx

    await promptToProceed(`**** [${hre.network.name}] oftOwner.transferOwnership(${multisigAddress}) Are you SURE ?`)
    tx = await (await oft.transferOwnership(multisigAddress)).wait()
    console.log(`oft.transferOwnership tx: ${tx.transactionHash}`)

    console.log(`*** ALL ownership transferred to: ${multisigAddress} ***`)
}
