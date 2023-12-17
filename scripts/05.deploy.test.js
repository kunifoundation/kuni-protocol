const {ethers} = require("hardhat");
const {mine} = require("@nomicfoundation/hardhat-network-helpers");
const _ = require("lodash");
const loadContract = require('./attach-contract')
const TOKENS = require('./contract.json')
const {cMintNft} = require("../js-commons/ama-data");
const {formatEther} = require("ethers");
const { IS_TESTNET, REF_ROOT, FOUNDATION_ADDR } = require("./00.load-env");

const {parseEther, MaxUint256} = ethers;

const log = console.log;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function approveToken(token, acc, spender) {
    console.log("token", await token.name(), formatEther(await token.balanceOf(acc.address)));
    if ((await token.allowance(acc.address, spender)) <= 0) {
        const t = await token.connect(acc).approve(spender, MaxUint256);
        await t.wait();
        // await sleep(150);
    }
}

async function approvedNFT(nft, acc, spender) {
    if (!(await nft.isApprovedForAll(acc.address, spender))) {
        await (await nft.connect(acc).setApprovalForAll(spender, true)).wait();
    }
}

async function main({ alex, bob, wFounder }) {
    log("\n======== TEST GAME ON TESTNET ========");
    const core = await loadContract()
    let foundation = FOUNDATION_ADDR;
    if (IS_TESTNET) {
        foundation = wFounder.address
    }

    // Mint saru
    await cMintNft(core.saru, alex, 5);
    await cMintNft(core.saru, bob, 5);

    log(await core.saru.balanceOf(alex.address));
    log(await core.saru.balanceOf(bob.address));

    log('00. scholarship....')
    await approvedNFT(core.saru, bob, TOKENS.scholarship)
    await (await core.scholarship.connect(bob).ask(TOKENS.kuniSaru, 6, 5000)).wait()

    log("01. apply referral code.....");
    await (await core.referral.connect(alex).applyCode(REF_ROOT)).wait();
    log("02. fighting.....");
    await (await core.game.connect(alex).fighting([1, 2, 6], [])).wait();
    log("03. earn kuni.....");
    await (await core.game.connect(alex).earnKuni()).wait();
    await (await core.game.connect(bob).earnKuni()).wait();
    await mine(500);
    const geAmount = await core.mining.geStakedOf(TOKENS.ge, alex.address);
    log("04. earn kuni.....");

    const kuniPending = await core.mining.pendingReward(TOKENS.ge, alex.address);
    const kuniPending2 = await core.mining.pendingReward(TOKENS.ge, foundation);
    log(`PENDING Alex: ${formatEther(kuniPending)}, Founder ${formatEther(kuniPending2)}`);
    await (await core.mining.connect(alex).claimKuni(TOKENS.ge, geAmount)).wait();
    const kuniAmount = await core.mining.balanceOf(alex.address);
    log("05. stack $kuni & saru .....", formatEther(kuniAmount));
    log("05.1. approved $kuni...");
    await approveToken(core.mining, alex, TOKENS.amaGame);
    log("05.2. approved Kuni Saru...");
    await approvedNFT(core.saru, alex, TOKENS.amaGame);
    log("06. Deposit...");
    await (await core.game.connect(alex).deposit(kuniAmount, [4, 5])).wait();
    log(await core.saru.balanceOf(TOKENS.amaGame), await core.saru.balanceOf(alex.address));
    await mine(500);
    log("07. Claim...");
    await (await core.game.connect(alex).claim()).wait();
    log("ore:", formatEther(await core.ore.balanceOf(alex.address)));
    log("stone:", formatEther(await core.stone.balanceOf(alex.address)));
    log("cotton:", formatEther(await core.cotton.balanceOf(alex.address)));
    log("lumber:", formatEther(await core.lumber.balanceOf(alex.address)));

    log("08. withdraw....");
    await (await core.game.connect(alex).withdraw()).wait();
    log("balanceOf: ", await core.saru.balanceOf(TOKENS.amaGame), await core.saru.balanceOf(alex.address));

    log("------ kuni inv ------");
    log("09. Approve Material....");
    await approveToken(core.ore, alex, TOKENS.amaInv);
    await approveToken(core.stone, alex, TOKENS.amaInv);
    await approveToken(core.cotton, alex, TOKENS.amaInv);
    await approveToken(core.lumber, alex, TOKENS.amaInv);
    await (
        await core.inv
            .connect(alex)
            .craft(
                [TOKENS.ore, TOKENS.stone, TOKENS.cotton, TOKENS.lumber],
                [parseEther("1.1"), parseEther("0.1"), parseEther("3.3"), parseEther("2.09")],
                0,
            )
    ).wait();
    log("kuniItem", await core.kuniItem.balanceOf(alex.address), await core.kuniItem.tokenOfOwnerByIndex(alex.address, 0));
    log("02. fighting with kuniItem.....");
    await (await core.game.connect(alex).fighting([6], [[0,0,0,0,5]])).wait();
    await (await core.game.connect(alex).earnKuni()).wait();
    
    async function claimKuni(acc, accTitle) {
        log(`\n====== ${accTitle} ====== ${acc.address}`);
        await (await core.mining.connect(acc).claimKuni(TOKENS.ge, await core.mining.geStakedOf(TOKENS.ge, acc.address))).wait();
        await (await core.game.connect(acc).claim()).wait()
        log("$GE IN GAME", formatEther(await core.game.unclaimedGE(acc.address)));
        log("$Hash rate: ", formatEther(await core.mining.geStakedOf(TOKENS.ge, acc.address)));
        log("$Kuni pending: ", formatEther(await core.mining.pendingReward(TOKENS.ge, acc.address)));
        log("$Ore pending: ", formatEther(await core.game.pendingReward(TOKENS.ore, acc.address)));
        log("$Ore: ", formatEther(await core.ore.balanceOf(acc.address)));
        log("$Kuni Owner: ", formatEther(await core.mining.balanceOf(acc.address)));
        log("$kuni in pool", formatEther(await core.mining.balanceOf(TOKENS.kuni)));
        log("$GE IN POOL", formatEther(await core.ge.balanceOf(TOKENS.kuni)));
    }
    log("\n\n$GE IN POOL ===> ", formatEther(await core.ge.balanceOf(TOKENS.kuni)));
    await claimKuni(bob, "BOB")
    await claimKuni(alex, "ALEX")
    await claimKuni(wFounder, "FOUNDATION")    
}

if (!IS_TESTNET)
    main()
        .catch((err) => log(err))
        .then(() => log("========= TESTED! ========="));

module.exports.testGameInTestnet = main;
