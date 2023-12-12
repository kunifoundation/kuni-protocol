const {expect} = require("chai");
const {ethers} = require("hardhat");
const {mine} = require("@nomicfoundation/hardhat-network-helpers");
const _ = require("lodash");
const {cMintNft, initCraftData, initSaruData, initPowerEffData} = require("../js-commons/ama-data");
const {formatEther, parseUnits, toNumber} = require("ethers");

const {parseEther, deployContract, MaxUint256, ZeroAddress} = ethers;

const e100 = parseEther("100");
const e50 = parseEther("50");
const e1 = parseEther("1");
const p16 = parseUnits("1", 16);

const log = console.log;
let tx;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadContractFrom(addr, cName) {
    const contract = await ethers.getContractFactory(cName);
    return contract.attach(addr);
}

async function getBlockNumber(name) {
    log(name || "", await ethers.provider.getBlockNumber());
}

async function checkApproved(self, tSaru, acc) {
    expect(tSaru).to.be.equal(await self.saru.balanceOf(acc.address));
    if (!(await self.saru.isApprovedForAll(acc.address, self.gameAddr))) {
        tx = await self.saru.connect(acc).setApprovalForAll(self.gameAddr, true);
        await tx.wait();
    }
    expect(true).to.be.eq(await self.saru.isApprovedForAll(acc.address, self.gameAddr));
}

async function deposit(self, acc, kuni, sarus) {
    tx = await self.game.connect(acc).deposit(kuni, sarus);
    await tx.wait();
}

async function checkDepositAfter(self, acc, tAcc, total) {
    expect(tAcc).to.be.eq(await self.game.balanceOf(acc.address));
    expect(total).to.be.eq(await self.saru.balanceOf(self.gameAddr));
}

async function approveToken(token, acc, spender) {
    console.log("token", await token.name(), (await token.balanceOf(acc.address)) / p16);
    if ((await token.allowance(acc.address, spender)) <= 0) {
        const t = await token.connect(acc).approve(spender, MaxUint256);
        await t.wait();
        await sleep(150);
    }
}

async function logMaterialsAddr(self, addr) {
    log("acc: ", addr);
    log("ore", formatEther(await self.materials.ore.balanceOf(addr)));
    log("stone", formatEther(await self.materials.stone.balanceOf(addr)));
    log("cotton", formatEther(await self.materials.cotton.balanceOf(addr)));
    log("lumber", formatEther(await self.materials.lumber.balanceOf(addr)));
}

async function logMaterials(self, acc) {
    await logMaterialsAddr(self, acc.address);
}

describe("------------- Staking token ------------------", () => {
    let deployer, bob, alex, axi, founder;
    let tx;
    before(async function () {
        // account init
        [deployer, bob, alex, axi, founder, ...addrs] = await ethers.getSigners();
        this.owner = deployer;

        let nonce = await deployer.provider.getTransactionCount(deployer.address);
        nonce = nonce + 1;
        this.meta = await (await deployContract("MetaData")).waitForDeployment({nonce});

        log("nonce", await deployer.provider.getTransactionCount(deployer.address));

        this.eco = await (await deployContract("EcoGame", [await this.meta.getAddress()])).waitForDeployment();
        this.mining = await (await ethers.deployContract("MiningKuni")).waitForDeployment();

        this.saru = await (await deployContract("KuniSaru")).waitForDeployment();
        this.scholar = await (await deployContract("Scholarship")).waitForDeployment();
        this.referal = await (await deployContract("Referral", [founder.address, "AMAKUNI"])).waitForDeployment();
        this.item = await (await deployContract("KuniItem")).waitForDeployment();

        this.ore = await (await ethers.deployContract("Material", ["Ore", "ORE"])).waitForDeployment();
        this.stone = await (await ethers.deployContract("Material", ["Stone", "STONE"])).waitForDeployment();
        this.cotton = await (await ethers.deployContract("Material", ["Cotton", "COTTON"])).waitForDeployment();
        this.lumber = await (await ethers.deployContract("Material", ["Lumber", "LUMBER"])).waitForDeployment();
        this.ge = await (await ethers.deployContract("GreenEnergy")).waitForDeployment();
        this.geAddr = await this.ge.getAddress();

        this.inv = await (await ethers.deployContract("AmaInv", [
            await this.mining.getAddress(), 
            await this.eco.getAddress(),
            await this.item.getAddress(),
        ])).waitForDeployment();

        this.game = await (
            await deployContract("AmaGame", [
                10,
                await this.mining.getAddress(),
                await this.saru.getAddress(),
                await this.item.getAddress(),
                await this.eco.getAddress(),
                await this.scholar.getAddress(),
                await this.referal.getAddress(),
                this.geAddr,
                founder.address
            ])
        ).waitForDeployment();

        this.gameAddr = await this.game.getAddress();

        this.mTokens = {
            ore: await this.ore.getAddress(),
            stone: await this.stone.getAddress(),
            cotton: await this.cotton.getAddress(),
            lumber: await this.lumber.getAddress(),
        };

        this.mTokenArr = _.values(this.mTokens);
        // console.log(this.mTokenArr);

        await (await this.ore.setMinter(this.gameAddr)).wait();
        await (await this.stone.setMinter(this.gameAddr)).wait();
        await (await this.cotton.setMinter(this.gameAddr)).wait();
        await (await this.lumber.setMinter(this.gameAddr)).wait();

        await (await this.ge.setMinter(this.gameAddr)).wait();

        expect(await this.game.materialAt(0)).to.be.eq(ZeroAddress);
        expect(await this.game.materialAt(1)).to.be.eq(ZeroAddress);
        expect(await this.game.materialAt(2)).to.be.eq(ZeroAddress);
        expect(await this.game.materialAt(3)).to.be.eq(ZeroAddress);
        await (await this.game.setMaterials(this.mTokenArr)).wait();

        await (await this.mining.addPool(await this.ge.getAddress(), [this.gameAddr, await this.inv.getAddress()])).wait();

        // await (await this.game.createMaterials(deployer.address)).wait()
        await (await this.mining.addCoreGame(await this.game.getAddress())).wait();

        await (await this.inv.setMaterialPic(this.mTokenArr, [1, 2, 3, 4])).wait();
        await (await this.item.setMinter(await this.inv.getAddress())).wait();

        await initPowerEffData(this.meta);
        await initCraftData(this.meta);

        // 1 - 10
        await initSaruData(this.meta, 0, 10);
        await cMintNft(this.saru, bob.address, 5);
        await cMintNft(this.saru, alex.address, 5);
        // await (await this.referal.connect(deployer).createCodeTo(founder.address, 'AMAKUNI', 1000)).wait()
        await (await this.referal.connect(bob).applyCode("AMAKUNI")).wait();

        this.kuni = this.mining;

        // function logType(arr) {
        //   log(arr.map(it => it/parseUnits('1', 17)).join(', '))
        // }
        // const m = await this.meta.getPowerTeam([1, 2])
        // logType(m[0])
        // logType(m[1])
        // log(m[2]/e1)
    });

    it("00. Check material", async function () {
        expect(await this.game.materialAt(0)).not.to.be.eq(ZeroAddress);
        expect(await this.game.materialAt(3)).not.to.be.eq(ZeroAddress);
        expect(this.mTokenArr[0]).to.be.eq(await this.ore.getAddress());
        expect("Ore").to.be.eq(await this.ore.name());
        expect("Stone").to.be.eq(await this.stone.name());
        expect("Cotton").to.be.eq(await this.cotton.name());
        expect("Lumber").to.be.eq(await this.lumber.name());
    });

    it("01. Check material deployed", async function () {
        expect("Ore").to.be.eq(await this.ore.name());
        expect("Stone").to.be.eq(await this.stone.name());
        expect("Cotton").to.be.eq(await this.cotton.name());
        expect("Lumber").to.be.eq(await this.lumber.name());
    });

    it("02. Check Saru balance of the Bob", async function () {
        await checkApproved(this, 5, bob);
        await checkApproved(this, 5, alex);
    });

    it("03. Deposit Saru", async function () {
        expect(0).to.be.eq(await this.game.balanceOf(bob.address));
        await deposit(this, bob, 0, [1, 2]);
        await checkDepositAfter(this, bob, 2, 2);
        tx = await this.game.connect(bob).withdrawTokens(0, [2]);
        await tx.wait();
        await checkDepositAfter(this, bob, 1, 1);
        tx = await this.game.connect(bob).withdraw();
        await tx.wait();
        await checkDepositAfter(this, bob, 0, 0);
    });

    it("04. Deposit & withdraw", async function () {
        await getBlockNumber("bob deposit: ");
        await checkDepositAfter(this, bob, 0, 0);
        await deposit(this, bob, 0, [1, 2]);
        await getBlockNumber("alex deposit: ");
        // await deposit(this, alex, parseEther('0.5'), [6, 7])
        // await (await this.game.connect(alex).withdraw()).wait()
        await (await this.game.connect(bob).withdraw()).wait();
        await getBlockNumber("End: ");
        // await (await this.game.connect(alex).withdraw()).wait()
        // await logMaterials(this, bob)
        // log(await this.game.userInfo(await this.ore.getAddress(), bob.address))
        // await logMaterials(this, alex)
        // log('\n-----------------\n')
        // await logMaterialsAddr(this, this.gameAddr)
    });

    it("05. fighting....", async function () {
        await expect(this.game.connect(bob).fighting([1, 2, 6], [])).to.be.revertedWith("KUNI: You are not the owner");
        tx = await this.game.connect(bob).fighting([1], [[0, 0, 0, 0, 0]]);
        await tx.wait();
        tx = await this.game.connect(bob).fighting([1, 2], []);
        await tx.wait();
        let lv = 20;
        while (lv > 0) {
            lv--;
            tx = await this.game.connect(bob).fighting([1, 2], []);
            await tx.wait();
            await sleep(500);
        }

        console.log("unclaimedGE: ", (await this.game.unclaimedGE(bob.address)) / e1);
        tx = await this.game.connect(bob).claimGE();
        await tx.wait();
        const totalGE = await this.ge.balanceOf(bob.address);
        log("GE", formatEther(totalGE));
        await approveToken(this.ge, bob, await this.mining.getAddress());
        await approveToken(this.ge, alex, await this.mining.getAddress());
        const geAddr = await this.ge.getAddress();
        const mineGE = totalGE / 4n;
        tx = await this.ge.connect(bob).transfer(alex.address, mineGE);
        await tx.wait();
        tx = await this.mining.connect(bob).mineKuni(geAddr, mineGE);
        await tx.wait();
        await mine(9206774 * 3);
        tx = await this.mining.connect(alex).mineKuni(geAddr, mineGE);
        await tx.wait();
        tx = await this.mining.connect(bob).claimKuni(geAddr, mineGE);
        await tx.wait();
        log("KUNI", (await this.mining.balanceOf(bob.address)) / e1);
        tx = await this.mining.connect(bob).mineKuni(geAddr, mineGE);
        await tx.wait();
        await mine(9206774 * 3);
        tx = await this.mining.connect(bob).claimKuni(geAddr, mineGE);
        await tx.wait();
        log("KUNI", (await this.mining.balanceOf(bob.address)) / e1);
        // tx = await this.mining.connect(bob).mineKuni(geAddr, mineGE)
        // await tx.wait()
        await mine(9206774 * 3);
        // tx = await this.mining.connect(bob).claimKuni(geAddr, mineGE)
        // await tx.wait()
        tx = await this.mining.connect(alex).claimKuni(geAddr, mineGE);
        await tx.wait();

        log("KUNI BOB", (await this.mining.balanceOf(bob.address)) / e1);
        expect(0).to.be.eq(await this.ge.balanceOf(alex.address));
        expect(mineGE).to.be.eq(await this.ge.balanceOf(bob.address));
        log("KUNI ALEX", (await this.mining.balanceOf(alex.address)) / e1);
    });

    it("07. deposit", async function () {
        log("kuni", (await this.mining.balanceOf(bob.address)) / p16);
        await approveToken(this.mining, bob, this.gameAddr);
        log("block 1: ", await ethers.provider.getBlockNumber());
        await (await this.game.connect(bob).deposit(parseEther("10"), [])).wait();
        log("kuni", (await this.mining.balanceOf(bob.address)) / p16);
        await mine(100000);
        log("ore bob pendingReward: ", (await this.game.pendingReward(await this.ore.getAddress(), bob.address)) / p16);
        // await (await this.game.connect(bob).withdraw()).wait()
        log("kuni", (await this.mining.balanceOf(bob.address)) / p16);
        log("ore after pendingReward: ", (await this.game.pendingReward(await this.ore.getAddress(), bob.address)) / p16);

        await (await this.game.connect(alex).fighting([7], [])).wait();
        await (await this.game.connect(alex).earnKuni()).wait();
        await mine(10);
        const geAddr = await this.ge.getAddress();
        await await this.mining.connect(alex).claimKuni(geAddr, await this.mining.geStakedOf(geAddr, alex.address));
        await approveToken(this.mining, alex, this.gameAddr);
        await (await this.game.connect(alex).deposit(await this.mining.balanceOf(alex.address), [])).wait();
        await mine(2);
        log("ore bob after pendingReward: ", (await this.game.pendingReward(await this.ore.getAddress(), bob.address)) / p16);
        log("ore alex after pendingReward: ", (await this.game.pendingReward(await this.ore.getAddress(), alex.address)) / p16);
        log("block 2: ", await ethers.provider.getBlockNumber());
        // await (await this.game.connect(bob).earnKuni()).wait()
        // await sleep(500)
    });

    // it("06. Game Inv Craft", async function() {
    //   // const inv = await (await deployContract('AmaInv', [  await this.eco.getAddress() ])).waitForDeployment();

    //   const invAddr = await this.inv.getAddress()

    //   log('fouder', (await this.ge.balanceOf(founder.address))/e1)

    //   tx = await this.item.setMinter(invAddr)
    //   await tx.wait()
    //   // console.log('address', invAddr);
    //   logMaterials(this, bob)
    // tx = await (await this.inv.setMaterialPic(this.mTokenArr, [1,2,3,4])).wait()
    //   await tx.wait()
    //   await approveToken(this.ore, bob, invAddr)
    //   await approveToken(this.stone, bob, invAddr)
    //   await approveToken(this.cotton, bob, invAddr)
    //   await approveToken(this.lumber, bob, invAddr)
    //   tx = await this.inv.connect(bob).craft(this.mTokenArr, ['1.2',1,1,2,1].map(t => parseEther(`${t}`)), 1)
    //   await tx.wait()
    //   log(await this.item.balanceOf(bob.address))
    //   log(await this.inv.currentCapOf(bob.address))
    // })

    // it('06. claim GE', async function() {
    //   // tx = await this.fWallet.emergencyWithdraw(await this.ge.getAddress(), axi.address)
    //   // await tx.wait()
    //   // log('axi', (await this.ge.balanceOf(axi.address))/e1)

    //   log('founder', (await this.ge.balanceOf(founder.address))/e1)
    //   await this.fWallet.setSpender(axi.address);
    //   await tx.wait()

    //   tx = await this.fWallet.connect(axi).mineKuni(await this.mining.getAddress(), await this.ge.getAddress())
    //   await tx.wait()

    //   expect(0).to.be.eq(await this.ge.balanceOf(founder.address))

    //   expect(0).to.be.eq(await this.mining.balanceOf(founder.address))
    //   tx = await this.fWallet.claimKuni(await this.mining.getAddress(), await this.ge.getAddress())
    //   await tx.wait()
    //   log((await this.mining.balanceOf(founder.address))/e1)

    //   tx = await this.fWallet.emergencyWithdraw(await this.mining.getAddress(), axi.address)
    //   await tx.wait()
    //   log('axi', (await this.mining.balanceOf(axi.address))/e1)
    //   expect(0).to.be.eq(await this.mining.balanceOf(founder.address))
    // })

    // it('07. check founder wallet', async function() {
    //   const fAddr = founder.address
    //   // log(()/e1)
    //   expect(0).to.be.eq(await ethers.provider.getBalance(fAddr))
    //   tx = await deployer.sendTransaction({from: deployer.address, to: fAddr, value: e1})
    //   await tx.wait()
    //   expect(e1).to.be.eq(await ethers.provider.getBalance(fAddr))
    //   tx = await this.fWallet.emergencyWithdraw(ZeroAddress, axi.address)
    //   await tx.wait()
    //   expect(0).to.be.eq(await ethers.provider.getBalance(fAddr))

    //   await expect(this.fWallet.connect(axi).emergencyWithdraw(ZeroAddress, axi.address)).revertedWith('Ownable: caller is not the owner')
    // })

    it("08. craft item", async function () {
        await mine(1000);
        await (await this.game.connect(bob).withdraw()).wait();
        const acc = bob;
        const invAddr = await this.inv.getAddress();
        await approveToken(this.cotton, bob, invAddr);
        await approveToken(this.stone, bob, invAddr);

        await (await this.inv.setMaterialPic(this.mTokenArr, [1, 2, 3, 4])).wait();
        const rs = await this.inv.connect(bob).craft(
            [this.mTokens.cotton, this.mTokens.stone],
            ["5.8", "4.2"].map((v) => parseEther(`${v}`)),
            1,
        );
        // log(rs.hash)
        this.inv.on("Craft", async function (sender, tokenId) {
            const meta = await this.item.getMeta(tokenId);
            let t = 0n;
            for (let index = 0; index < meta.length - 1; index++) {
                if (index === 0) continue;
                t += meta[index];
            }
            log("power", t / p16);
        });

        await rs.wait();

        log(await this.inv.currentCapOf(bob.address));
        await sleep(1000);
        const meta = await this.item.getMeta(1);
        let t = 0n;
        for (let index = 0; index < meta.length - 1; index++) {
            if (index === 0) continue;
            t += meta[index];
        }
        log("power", t / p16);
        // }
        // await sleep(10000)
    });
});
