const { IS_TESTNET, FOUNDATION_ADDR } = require('./00.load-env');
const loadContract = require('./attach-contract')

const log = console.log

async function main({foundation}) {
    log(`\n======= TRANSFER FOUNDATION..... ========`);
    const [deployer, ...addrs] = await ethers.getSigners();
    const core = await loadContract()
    const BALANCE_START = await ethers.provider.getBalance(deployer.address);
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    await (await core.eco.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.meta.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.storeGame.transferOwnership(foundation, {nonce: nonce++})).wait()

    await (await core.game.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.inv.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.mining.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.referral.transferOwnership(foundation, {nonce: nonce++})).wait()

    await (await core.ore.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.cotton.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.stone.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.lumber.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.ge.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.kuniItem.transferOwnership(foundation, {nonce: nonce++})).wait()
    await (await core.kuniSaru.transferOwnership(foundation, {nonce: nonce++})).wait() 
    log("Balance Fee: ", ethers.formatEther(BALANCE_START - (await ethers.provider.getBalance(deployer.address))), "ETH");
}

main({ foundation: FOUNDATION_ADDR })
    .catch((err) => log(err))
    .then(() => log("========= METADATA INITIALIZED ========="));
    
