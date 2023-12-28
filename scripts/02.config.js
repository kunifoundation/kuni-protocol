const {ethers} = require("hardhat");
const loadContract = require('./attach-contract')
const TOKENS = require("./contract.json")

const log = console.log;

async function main() {
    const [deployer] = await ethers.getSigners();
    const BALANCE_START = await ethers.provider.getBalance(deployer.address);
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    log('nonce', nonce, ethers.formatEther(BALANCE_START))
    
    // init contract from token
    const core = await loadContract()

    log("\n=========== CONFIG GAME =========== ");
    log("01. Config game....");
    await (await core.game.setMaterials([TOKENS.ore, TOKENS.stone, TOKENS.cotton, TOKENS.lumber], {nonce: nonce})).wait();
    log("02. Config kuni mining....");
    await (await core.mining.addPool(TOKENS.ge, [TOKENS.amaGame, TOKENS.amaInv], {nonce: ++nonce})).wait();
    await (await core.mining.addCoreGame(TOKENS.amaGame, {nonce: ++nonce})).wait();
    log("03. Config kuni inv...");
    await (await core.inv.setMaterialPic([TOKENS.ore, TOKENS.stone, TOKENS.cotton, TOKENS.lumber], [1, 2, 3, 4], {nonce: ++nonce})).wait();
    log("04. Config kuni item...");
    await (await core.kuniItem.addMinter(TOKENS.amaInv, {nonce: ++nonce})).wait();
    log("05. Config minter for token...");
    await (await core.ore.addMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    await (await core.stone.addMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    await (await core.cotton.addMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    await (await core.lumber.addMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    await (await core.ge.addMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    log('config store game')
    await (await core.storeGame.updateGame(TOKENS.amaGame, TOKENS.amaInv, {nonce: ++nonce})).wait();
    log("Balance Fee: ", ethers.formatEther(BALANCE_START - (await ethers.provider.getBalance(deployer.address))), "ETH");
}

main()
    .catch((err) => log(err))
    .then(() => log("========= CONFIGURATION COMPLETED! ========="));



