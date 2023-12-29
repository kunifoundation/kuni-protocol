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
const p12 = parseUnits("1", 12);

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
    await nftApproved(self.saru, acc, self.gameAddr)
}

async function nftApproved(saru, acc, spender) {
    if (!(await saru.isApprovedForAll(acc.address, spender))) {
        await (await saru.connect(acc).setApprovalForAll(spender, true)).wait();
    }
    expect(true).to.be.eq(await saru.isApprovedForAll(acc.address, spender));
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
    // console.log("Token", await token.name(), (await token.balanceOf(acc.address)) / p16);
    if ((await token.allowance(acc.address, spender)) == 0) {
        const t = await token.connect(acc).approve(spender, MaxUint256);
        await t.wait();
        await sleep(150);
    }
}

async function logMaterialsAddr(self, addr) {
    log("ACC: ", addr);
    log("ore", formatEther(await self.materials.ore.balanceOf(addr)));
    log("stone", formatEther(await self.materials.stone.balanceOf(addr)));
    log("cotton", formatEther(await self.materials.cotton.balanceOf(addr)));
    log("lumber", formatEther(await self.materials.lumber.balanceOf(addr)));
}

async function logMaterials(self, acc) {
    await logMaterialsAddr(self, acc.address);
}

describe("------------- STAKING TOKEN & SARU ------------------", () => {
    let deployer, bob, alex, axi, founder, jul;
    let tx;
    before(async function () {
        // account init
        [deployer, bob, alex, axi, founder, jul, ...addrs] = await ethers.getSigners();
        this.owner = deployer;
        this.meta = await (await deployContract("MetaData")).waitForDeployment();
        this.eco = await (await deployContract("EcoGame", [await this.meta.getAddress()])).waitForDeployment();
        this.mining = await (await ethers.deployContract("MiningKuni")).waitForDeployment();

        this.saru = await (await deployContract("KuniSaru")).waitForDeployment();
        this.scholar = await (await deployContract("Scholarship")).waitForDeployment();
        this.referal = await (await deployContract("Referral", [founder.address, "AMAKUNI"])).waitForDeployment();
        this.item = await (await deployContract("KuniItem")).waitForDeployment();
        // this.fMaterial = await (await ethers.deployContract('MaterialFactory')).waitForDeployment();

        this.ore = await (await ethers.deployContract("Material", ["Ore", "ORE"])).waitForDeployment();
        this.stone = await (await ethers.deployContract("Material", ["Stone", "STONE"])).waitForDeployment();
        this.cotton = await (await ethers.deployContract("Material", ["Cotton", "COTTON"])).waitForDeployment();
        this.lumber = await (await ethers.deployContract("Material", ["Lumber", "LUMBER"])).waitForDeployment();


        this.ge = await (await ethers.deployContract("GreenEnergy")).waitForDeployment();
        
        this.geAddr = await this.ge.getAddress();
        

        this.mTokens = {
            ore: await this.ore.getAddress(),
            stone: await this.stone.getAddress(),
            cotton: await this.cotton.getAddress(),
            lumber: await this.lumber.getAddress(),
        };
        this.mTokenArr = _.values(this.mTokens);

        this.inv = await (await ethers.deployContract("AmaInv", [
            await this.mining.getAddress(), 
            await this.eco.getAddress(), 
            await this.item.getAddress()
        ])).waitForDeployment();

        this.game = await (
            await deployContract("AmaGame", [
                25,
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

        await (await this.ore.addMinter(this.gameAddr)).wait();
        await (await this.stone.addMinter(this.gameAddr)).wait();
        await (await this.cotton.addMinter(this.gameAddr)).wait();
        await (await this.lumber.addMinter(this.gameAddr)).wait();
        await (await this.ge.addMinter(this.gameAddr)).wait();
        expect(await this.game.getMaterials(0)).to.be.eq(ZeroAddress);
        expect(await this.game.getMaterials(1)).to.be.eq(ZeroAddress);
        expect(await this.game.getMaterials(2)).to.be.eq(ZeroAddress);
        expect(await this.game.getMaterials(3)).to.be.eq(ZeroAddress);
        await (await this.game.setMaterials(this.mTokenArr)).wait();
        expect(await this.game.getMaterials(0)).to.be.eq(this.mTokenArr[0]);

        await (await this.mining.addPool(await this.ge.getAddress(), [this.gameAddr, await this.inv.getAddress()])).wait();

        // await (await this.game.createMaterials(deployer.address)).wait()
        await (await this.mining.addCoreGame(await this.game.getAddress())).wait();

        await (await this.inv.setMaterialPic(this.mTokenArr, [1, 2, 3, 4])).wait();
        // await (await this.inv.setKuniItem(await this.item.getAddress())).wait();
        await (await this.item.addMinter(await this.inv.getAddress())).wait();

        await initPowerEffData(this.meta);
        await initCraftData(this.meta);

        // 1 - 100
        const balance = await deployer.provider.getBalance(await deployer.getAddress());
        const self = this;
        async function initSaru(start) {
            const limit = 125
            await initSaruData(self.meta, start * limit, (++start) * limit, false);
            await initSaruData(self.meta, start * limit, (++start) * limit, false);
            await initSaruData(self.meta, start * limit, (++start) * limit, false);
            await initSaruData(self.meta, start * limit, (++start) * limit, false);
            await initSaruData(self.meta, start * limit, (++start) * limit, false);
            await initSaruData(self.meta, start * limit, (++start) * limit, false);
            await initSaruData(self.meta, start * limit, (++start) * limit, false);
            await initSaruData(self.meta, start * limit, (++start) * limit, false);
            return start;
        }

        let start = 0;
        start = await initSaru(start);
        // start = await initSaru(start);
        // start = await initSaru(start);
        // start = await initSaru(start);
        // start = await initSaru(start);
        // start = await initSaru(start);
        // start = await initSaru(start);
        // start = await initSaru(start);
        // start = await initSaru(start);
        // start = await initSaru(start);
        log("block number: ", await ethers.provider.getBlockNumber());
        log("balance: ", ethers.formatEther(balance - (await deployer.provider.getBalance(await deployer.getAddress()))));
        await cMintNft(this.saru, bob.address, 5);
        await cMintNft(this.saru, alex.address, 5);
        await cMintNft(this.saru, bob.address, 2);
        await cMintNft(this.saru, axi.address, 8)

        await (await this.referal.connect(bob).applyCode("AMAKUNI")).wait();
        this.kuni = this.mining;
    });

    it("00. Check material", async function () {
        expect(await this.game.getMaterials(0)).not.to.be.eq(ZeroAddress);
        expect(await this.game.getMaterials(3)).not.to.be.eq(ZeroAddress);
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
        await checkApproved(this, 7, bob);
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
        await expect(this.game.connect(bob).fighting([1, 2, 2], [])).to.be.revertedWith("KUNI: Saru Duplicated!");
        // await expect(this.game.connect(bob).fighting([1, 2, 3], [
        //     [1,2,3,4,5],
        //     [0,7,8,9,10],
        //     [1,12,13,14,15]
        // ])).to.be.revertedWith("KUNI: Item Duplicated!");
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

    it("06. deposit", async function () {
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

    it("07. craft item", async function () {
        await mine(100000);
        await (await this.game.connect(bob).claim()).wait()
        await mine(100000);
        await (await this.game.connect(bob).claim()).wait()
        await mine(100000);
        await (await this.game.connect(bob).withdraw()).wait();
        await (await this.game.connect(bob).claim()).wait()
        const invAddr = await this.inv.getAddress();
        await (await this.inv.setMaterialPic(this.mTokenArr, [1, 2, 3, 4])).wait();
        const self = this;
        async function fnCraft(acc, tokens, amount, _type) {
            let i = 0;
            while (i < tokens.length) {
                await approveToken(self[tokens[i]], acc, invAddr);
                i++;
                await sleep(200);
            }

            const rs = await self.inv.connect(acc).craft(
                tokens.map((t) => self.mTokens[t]),
                amount.map((v) => parseEther(`${v}`)),
                _type,
            );
            // 5.000.000.000.000.000.000
            await rs.wait();
        }

        await fnCraft(bob, ["ore"], [1], 0);
        await fnCraft(bob, ["stone"], [2], 0);
        await fnCraft(bob, ["cotton"], [3], 0);
        await fnCraft(bob, ["lumber"], [4], 0);

        await fnCraft(bob, ["ore", "cotton"], [3, 2], 1);
        await fnCraft(bob, ["ore", "stone"], [4, 2], 1);

        await fnCraft(bob, ["ore"], [7], 0);
        await fnCraft(bob, ["stone"], [8], 0);
        await fnCraft(bob, ["cotton"], [9], 0);
        await fnCraft(bob, ["lumber"], [10], 0);

        await fnCraft(bob, ["ore", "lumber"], [20, 2], 1);
        await fnCraft(bob, ["stone", "cotton"], [20, 2], 1);
        await fnCraft(bob, ["stone", "lumber"], [20, 2], 1);
        await fnCraft(bob, ["cotton", "lumber"], [20, 2], 1);
        await fnCraft(bob, ["ore", "lumber"], [20, 2], 1);
        await fnCraft(bob, ["ore", "lumber"], [20, 2], 1);
        await fnCraft(bob, ["ore", "lumber"], [20, 2], 1);

        await fnCraft(bob, ["ore"], [41], 0);
        await fnCraft(bob, ["stone"], [41], 0);
        await fnCraft(bob, ["cotton"], [41], 0);
        await fnCraft(bob, ["lumber"], [41], 0);

        await fnCraft(bob, ["ore"], [41], 0);
        await fnCraft(bob, ["stone"], [42], 0);
        await fnCraft(bob, ["cotton"], [46], 0);
        await fnCraft(bob, ["lumber"], [41], 0);

        await fnCraft(bob, ["ore"], [42], 0);
        await fnCraft(bob, ["stone"], [42], 0);
        await fnCraft(bob, ["cotton"], [46], 0);
        await fnCraft(bob, ["lumber"], [44], 0);

        await fnCraft(bob, ["ore"], [42], 0);
        await fnCraft(bob, ["stone"], [42], 0);
        await fnCraft(bob, ["cotton"], [46], 0);
        await fnCraft(bob, ["lumber"], [44], 0);

        await fnCraft(bob, ["ore"], [42], 0);
        await fnCraft(bob, ["stone"], [42], 0);
        await fnCraft(bob, ["cotton"], [46], 0);
        await fnCraft(bob, ["lumber"], [44], 0);

        log(await this.item.lastTokenIdOf(1));
        log(await this.item.lastTokenIdOf(2));
        log(await this.item.lastTokenIdOf(3));
        log(await this.item.lastTokenIdOf(4));
        log(await this.item.lastTokenIdOf(5));

        log(await this.inv.currentCapOf(bob.address));
        await sleep(1000);
        const total = await this.item.balanceOf(bob.address);
        const tokenIds = (await Promise.all(_.range(0, toNumber(total)).map((index) => this.item.tokenOfOwnerByIndex(bob.address, index)))).map((t) =>
            toNumber(t),
        );
        console.log(tokenIds);
        if (total > 0) {
            const meta = await this.item.getMeta(tokenIds[0]);
            let t = 0n;
            for (let index = 0; index < meta.length - 1; index++) {
                if (index === 0) continue;
                t += meta[index];
            }
            log("power", t / p16);
        }
        // await sleep(10000)
    });

    it('08. Check pending', async function(){
        const self = this
        await (await this.game.connect(bob).deposit(e50, [2, 3, 4, 5])).wait()
        await mine(500)
        await (await this.game.connect(alex).deposit(0, [6, 7])).wait()
        async function checkMaterialPending(acc, name, tokenIds) {
            log(`\n========= BEFORE WITHDRAW ${name} =========`)
            const saruStaked = await self.game.balanceOf(acc.address)
            log("Saru staked", saruStaked)
            
            log('KUNI OF POOL', (await self.game.kuniStakedOf(acc.address))/p16)
            log("ORE: ", (await self.game.pools(await self.ore.getAddress()))[1]/p16, (await self.game.pendingReward(await self.ore.getAddress(), acc.address)) / p12);
            log("STONE: ", (await self.game.pendingReward(await self.stone.getAddress(), acc.address)) / p12);
            log("COTTON: ", (await self.game.pendingReward(await self.cotton.getAddress(), acc.address)) / p12);
            log("LUMBER: ", (await self.game.pendingReward(await self.lumber.getAddress(), acc.address)) / p12);
            log(`========= AFFTER WITHDRAW ${name} =========`)
            if (tokenIds) {
                await (await self.game.connect(acc).withdrawTokens(0, tokenIds)).wait()
            } else {
                await (await self.game.connect(acc).withdraw()).wait()
            }
            
            log("Saru staked", await self.game.balanceOf(acc.address))
            log('KUNI OF POOL', (await self.game.kuniStakedOf(acc.address)/p16))
            log("ORE: ", (await self.game.pools(await self.ore.getAddress()))[1]/p16, (await self.game.pendingReward(await self.ore.getAddress(), acc.address)) / p16);
            log("STONE: ", (await self.game.pendingReward(await self.stone.getAddress(), acc.address)) / p16);
            log("COTTON: ", (await self.game.pendingReward(await self.cotton.getAddress(), acc.address)) / p16);
            log("LUMBER: ", (await self.game.pendingReward(await self.lumber.getAddress(), acc.address)) / p16);
        }

        await checkMaterialPending(alex, "Alex", [6])
        await checkMaterialPending(bob, "Bob")
        await checkMaterialPending(alex, "Alex")
    })

    it('09. Input fighting SARU & ITEM', async function() {
        await expect(this.game.connect(bob).fighting([1, 2, 2], [])).to.be.revertedWith("KUNI: Saru Duplicated!");
        await expect(this.game.connect(bob).fighting([0, 2], [])).to.be.revertedWith("ERC721: invalid token ID");
        await expect(this.game.connect(bob).fighting([1, 2, 3, 4, 5, 11, 12], [])).to.be.revertedWith("KUNI: Unable to process request");
        await expect(this.game.connect(bob).fighting([1, 2, 3], [
            [1,2,3,4,5],
            [6,7,0,4,10],
            [1,12,3,14,15]
        ])).revertedWith("KUNI: Item Duplicated!")

        await expect(this.game.connect(bob).fighting([1, 2, 3], [
            [1,2,3,4,5],
            [0,2,0,0,0],
            [0,0,0,0,0]
        ])).revertedWith("KUNI: Item Duplicated!")

        await (await this.game.connect(bob).fighting([1, 2, 3], [
            [1,2,0,4,5]
        ])).wait()
    })

    it('10. fighting and earn', async function() {
        await (await this.game.connect(bob).fightingAndEarn([1, 2, 3, 4, 5, 11], [
            [1,2,3,4,5],
            [6,7,8,9,10],
            [11,12,13,14,15],
            [16,17,18,19,20],
            [21,22,23,24,25],
            [26,27,28,29,30]
        ])).wait()

        await (await this.game.connect(bob).fightingAndEarn([1], [
        ])).wait()
        await (await this.game.connect(bob).fightingAndEarn([1], [
        ])).wait()
    })

    it('11. Test withdrawTokens', async function() {
        const years = (5*365*24*60*60)/3; // 5 years
        await (await this.game.connect(bob).deposit(parseEther('1'), [1,2,3])).wait()
        await (await this.game.connect(bob).withdrawTokens(0, [3])).wait()
        await mine(years)
        await (await this.game.connect(bob).claim()).wait()
        log(formatEther(await this.ore.totalSupply()))
        await mine(years)
        await (await this.game.connect(bob).claim()).wait()
        await mine(years)
        await (await this.game.connect(bob).claim()).wait()
        await mine(years)
        await (await this.game.connect(bob).claim()).wait()
        log(formatEther(await this.ore.totalSupply()))
        await expect(this.game.connect(alex).withdrawTokens(0, [3])).rejectedWith("KUNI: You are not the owner")
    })

    it('12. Scholarship', async function() {
        await (await this.referal.connect(bob).createCode("BOB_0", 0)).wait()
        await (await this.referal.connect(bob).createCode("BOB_100", 10000)).wait()
        await (await this.referal.connect(axi).applyCreateCode("BOB_0", "AXI")).wait()
        await nftApproved(this.saru, axi, await this.scholar.getAddress())
        expect(await this.saru.ownerOf(17)).eq(axi.address )
        await (await this.scholar.connect(axi).askBatch(await this.saru.getAddress(), [17, 19], [0, 10000])).wait();
        await (await this.game.connect(axi).fighting([18], [])).wait()
        log('$GE', ethers.formatEther(await this.game.unclaimedGE(axi.address)))
        await expect(await this.game.unclaimedGE(axi.address)).eq(ethers.parseEther('15'))
        await (await this.referal.connect(jul).applyCreateCode("BOB_100", "JUL")).wait() // ref 100%
        await (await this.game.connect(jul).fighting([19], [])).wait()
        await expect(await this.game.unclaimedGE(axi.address)).eq(ethers.parseEther('25'))
        await expect(await this.game.unclaimedGE(jul.address)).eq(ethers.parseEther('0'))
        await (await this.game.connect(jul).fighting([17], [])).wait()
        await expect(await this.game.unclaimedGE(jul.address)).eq(ethers.parseEther('20'))
    })

    it('13. remove minter', async function() {
        await (await this.ore.removeMinter(await this.game.getAddress())).wait()
        await (await this.lumber.removeMinter(await this.game.getAddress())).wait()
        await (await this.cotton.removeMinter(await this.game.getAddress())).wait()
        await (await this.stone.removeMinter(await this.game.getAddress())).wait()
        await (await this.game.connect(bob).claim()).wait()
    })

    it('14. diposit saru & kuni', async function() {
        await deposit(this, bob, parseEther('0.5'), [11, 12]);
        await (await this.game.connect(bob).claim()).wait()
        await checkDepositAfter(this, bob, 4, 4);
    })
});
