const {ethers} = require("hardhat");

const TOKENS = require("./contract.json")
const loadContract = require('./attach-contract');
const {writeWithToken} = require("../js-commons/io");


const {deployContract} = ethers;

const log = console.log;
async function main() {
    const [deployer] = await ethers.getSigners();
    const BALANCE_START = await ethers.provider.getBalance(deployer.address);
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    const core = await loadContract()
    log(`======= DEPLOY..... ========\n`);
    log("DEPLOY COMMON...");
    this.eco = await (await deployContract("EcoGame", [TOKENS.metaData])).waitForDeployment({nonce: ++nonce});
    const ecoGame = await this.eco.getAddress();
    log("1. EcoGame: ", ecoGame);
    
    await (await core.game.setEco(ecoGame)).wait()
    log('set eco for game')
    await (await core.inv.setEco(ecoGame)).wait()
    log('set eco for inv')
    log("\n=========== TOKEN DEPLOYED! ===========\n");

    log("Balance Fee: ", ethers.formatEther(BALANCE_START - (await ethers.provider.getBalance(deployer.address))), "BNB");
    TOKENS.ecoGame = ecoGame
    writeWithToken(TOKENS, "_contract-eco.js", 0, "json");
}

main()
    .catch((err) => log(err))
    .then(() => log("========= DEPLOYED! ========="));
