const {expect} = require("chai");
const {ethers} = require("hardhat");
const _ = require("lodash");
const {initPowerEffData, initCraftData, initSaruData, toByteByName} = require("../js-commons/ama-data");
const {fnReadFile} = require("../js-commons/utils");
const {parseEther} = require("ethers");

const {deployContract, parseUnits} = ethers;

const log = console.log;

function exData(expected, actual, fix, decimal = 18) {
    if (!decimal) {
        decimal = 18;
    }
    if (fix) {
        const magic = BigInt(Math.pow(10, decimal - fix));
        actual = actual.map((t) => t / magic);
    }
    for (let index = 0; index < expected.length; index++) {
        expect(expected[index]).equal(actual[index]);
    }
}

describe("------------- METADATA ------------------", () => {
    let deployer, bob, alex;
    let tx;
    before(async function () {
        // account init
        [deployer, bob, alex, axi, ...addrs] = await ethers.getSigners();
        this.deployer = deployer;
        this.metadata = await (await deployContract("MetaData")).waitForDeployment();

        await initPowerEffData(this.metadata);
        await initCraftData(this.metadata);
        // 1 - 10
        await initSaruData(this.metadata, 0, 10);
    });

    it("00. Check Efficiency Staft", async function () {
        const key = toByteByName("Tactical helmet"); //'0x11d94b0cef30991467e3f75a927ce81421742bd2c35581d13c99c65e27737eca'
        const rs = await this.metadata.getEfficiency(key);
        const exRs = ["0.3", "0.1", "0.2", "0.4"].map((v) => parseEther(v));
        for (let inx = 0; inx < exRs.length; inx++) {
            expect(rs[inx]).to.be.equal(exRs[inx]);
        }

        expect((await this.metadata.getPower(toByteByName("Dragon Lance")))[5]).to.be.eq(1);
    });

    it("01. Check Power tokeId: 1 - 2 and team", async function () {
        const s1 = await this.metadata.getPowerTokenId(1);
        exData([8976, 0, 80789, 0, 0], s1[0], 3); //attack
        exData([29118, 50773, 14192, 83333, 14192], s1[1], 3); // define
        exData([281377], [s1[2]], 3); // total

        const team = await this.metadata.getPowerTeam([1, 2]);
        exData([8976, 38095, 80789, 9523, 0], team[0], 3); //attack
        exData([35645, 58436, 20719, 117104, 54525], team[1], 3); // define
        exData([423816], [team[2]], 3);

        const s2 = await this.metadata.getPowerTokenId(2);
        exData([0, 38095, 0, 9523, 0], s2[0], 3); //attack
        exData([6526, 7662, 6526, 33770, 40332], s2[1], 3); // define
        exData([142439], [s2[2]], 3); // total
    });

    it("02. Check Eff token 1", async function () {
        const ex1 = [110, 180, 150, 10];
        const eff = await this.metadata.getEfficiencyTokenId(1);
        exData(ex1, eff, 2);

        const ex2 = [30, 130, 30, 190];
        const eff2 = await this.metadata.getEfficiencyTokenId(2);
        exData(ex2, eff2, 2);

        let exTeam = ex1;
        for (let i = 0; i < ex2.length; i++) {
            exTeam[i] += ex2[i];
        }

        const aTeam = await this.metadata.getEfficiencyTokenIds([1, 2]);
        exData(exTeam, aTeam, 2);
    });

    it("03. Check power total ", async function () {
        // TokenId: 1
        let exp = [38094, 50773, 94982, 83333, 14192];
        const p = await this.metadata.getPowerAllTokenId(1);
        exData(exp, p[0], 3); //attack
        exData([281377], [p[1]], 3);
        // TokenId: 2
        const exp2 = [6526, 45758, 6526, 43294, 40332];
        const p2 = await this.metadata.getPowerAllTokenId(2);
        exData(exp2, p2[0], 3); //attack
        exData([142439], [p2[1]], 3);
        // TokenId 1, 2
        const expTeam = [44621, 96531, 101509, 126627, 54525];
        const team = await this.metadata.getPowerAllTeam([1, 2]);
        exData(expTeam, team[0], 3); //attack
        exData([423816], [team[1]], 3);
    });

    it("04. check material", async function () {
        // Ore
        exData([75, 10, 0, 15, 10], await this.metadata.materialBy(1), 2);
        // Stone
        exData([10, 75, 15, 0, 10], await this.metadata.materialBy(2), 2);
        // cotton
        exData([15, 0, 10, 75, 10], await this.metadata.materialBy(3), 2);
        // lumber
        exData([0, 15, 75, 10, 10], await this.metadata.materialBy(4), 2);
    });

    it("05. check craft info", async function () {
        const self = this;
        async function checkCraftInfo(nameExp, key, cat) {
            const val = await self.metadata.itemMetaBy(key);
            expect(nameExp).to.be.equal(val[0]);
            expect(cat).to.be.equal(val[1]);
        }

        await checkCraftInfo("Sword #1", 12000, 1);
        await checkCraftInfo("Sword #2", 10200, 1);
        await checkCraftInfo("Sword #3", 10020, 1);
        await checkCraftInfo("Sword #4", 10002, 1);
        await checkCraftInfo("Axe #1", 21000, 1);
        await checkCraftInfo("Axe #2", 1200, 1);
        await checkCraftInfo("Axe #3", 1020, 1);
        await checkCraftInfo("Axe #4", 1002, 1);
        await checkCraftInfo("Lance #1", 20100, 1);
        await checkCraftInfo("Lance #2", 2100, 1);
        await checkCraftInfo("Lance #3", 120, 1);
        await checkCraftInfo("Lance #4", 102, 1);
        await checkCraftInfo("Gun #1", 20010, 1);
        await checkCraftInfo("Gun #2", 2010, 1);
        await checkCraftInfo("Gun #3", 210, 1);
        await checkCraftInfo("Gun #4", 12, 1);
        await checkCraftInfo("Hat #1", 12300, 2);
        await checkCraftInfo("Hat #2", 12030, 2);
        await checkCraftInfo("Hat #3", 12003, 2);
        await checkCraftInfo("Hat #4", 13200, 2);
        await checkCraftInfo("Hat #5", 10230, 2);
        await checkCraftInfo("Hat #6", 10203, 2);
        await checkCraftInfo("Hat #7", 13020, 2);
        await checkCraftInfo("Hat #8", 10320, 2);
        await checkCraftInfo("Hat #9", 10023, 2);
        await checkCraftInfo("Hat #10", 13002, 2);
        await checkCraftInfo("Hat #11", 10302, 2);
        await checkCraftInfo("Hat #12", 10032, 2);
        await checkCraftInfo("Body #1", 21300, 3);
        await checkCraftInfo("Body #2", 21030, 3);
        await checkCraftInfo("Body #3", 21003, 3);
        await checkCraftInfo("Body #4", 31200, 3);
        await checkCraftInfo("Body #5", 1230, 3);
        await checkCraftInfo("Body #6", 1203, 3);
        await checkCraftInfo("Body #7", 31020, 3);
        await checkCraftInfo("Body #8", 1320, 3);
        await checkCraftInfo("Body #9", 1023, 3);
        await checkCraftInfo("Body #10", 31002, 3);
        await checkCraftInfo("Body #11", 1302, 3);
        await checkCraftInfo("Body #12", 1032, 3);
        await checkCraftInfo("Glasses #1", 23100, 4);
        await checkCraftInfo("Glasses #2", 20130, 4);
        await checkCraftInfo("Glasses #3", 20103, 4);
        await checkCraftInfo("Glasses #4", 32100, 4);
        await checkCraftInfo("Glasses #5", 2130, 4);
        await checkCraftInfo("Glasses #6", 2103, 4);
        await checkCraftInfo("Glasses #7", 30120, 4);
        await checkCraftInfo("Glasses #8", 3120, 4);
        await checkCraftInfo("Glasses #9", 123, 4);
        await checkCraftInfo("Glasses #10", 30102, 4);
        await checkCraftInfo("Glasses #11", 3102, 4);
        await checkCraftInfo("Glasses #12", 132, 4);
        await checkCraftInfo("Gloves #1", 23010, 5);
        await checkCraftInfo("Gloves #2", 20310, 5);
        await checkCraftInfo("Gloves #3", 20013, 5);
        await checkCraftInfo("Gloves #4", 32010, 5);
        await checkCraftInfo("Gloves #5", 2310, 5);
        await checkCraftInfo("Gloves #6", 2013, 5);
        await checkCraftInfo("Gloves #7", 30210, 5);
        await checkCraftInfo("Gloves #8", 3210, 5);
        await checkCraftInfo("Gloves #9", 213, 5);
        await checkCraftInfo("Gloves #10", 30012, 5);
        await checkCraftInfo("Gloves #11", 3012, 5);
        await checkCraftInfo("Gloves #12", 312, 5);
    });

    it("06. Check Continental Multiplier", async function () {
        const self = this;
        async function exContinental(cType, vals) {
            expect(parseUnits(`${vals[0]}`, 12)).to.be.equal(await self.metadata.getContinentalMultiplier(cType, 1));
            expect(parseUnits(`${vals[0]}`, 12)).to.be.equal(await self.metadata.getContinentalMultiplier(cType, 1));
            expect(parseUnits(`${vals[0]}`, 12)).to.be.equal(await self.metadata.getContinentalMultiplier(cType, 1));
            expect(parseUnits(`${vals[0]}`, 12)).to.be.equal(await self.metadata.getContinentalMultiplier(cType, 1));
        }
        log(await this.metadata.getContinentalMultiplier(1, 1));

        // ore; stone; cotton; lumber
        await (1, [0.6, 1, 0.1, 0.3]);
        await (2, [1, 0.6, 0.3, 0.1]);
        await (3, [0.3, 0.1, 0.6, 1]);
        await (4, [0.1, 0.3, 1, 0.6]);
    });
});
