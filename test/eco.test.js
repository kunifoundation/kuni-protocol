const {expect} = require("chai");
const {ethers} = require("hardhat");
const _ = require("lodash");
const {initPowerEffData, initCraftData, initSaruData, toByteByName} = require("../js-commons/ama-data");
const { parseEther, parseUnits } = require("ethers");

const {deployContract, getContractFactory} = ethers;

const log = console.log;
const p16 = parseUnits('1', 16)

function exData(expected, actual, fix) {
    if (fix) {
        const magic = BigInt(Math.pow(10, 18 - fix));
        actual = actual.map((t) => t / magic);
    }
    for (let index = 0; index < expected.length; index++) {
        expect(expected[index]).equal(actual[index]);
    }
}

describe("------------- ECO GAME ------------------", () => {
    let deployer, bob, alex, addrs;
    let tx;
    before(async function () {
        // account init
        [deployer, bob, alex, axi, ...addrs] = await ethers.getSigners();

        this.meta = await (await deployContract("MetaData")).waitForDeployment();
        this.eco = await (await getContractFactory("EcoGame")).deploy(await this.meta.getAddress());
        await initPowerEffData(this.meta);
        await initCraftData(this.meta);
        // 1 - 10
        await initSaruData(this.meta, 0, 10);
    });

    it("00. Create Material", async function () {
        const ex1 = [110, 180, 150, 10];
        const eff = await this.eco.productionEfficiency(1);
        exData(ex1, eff, 2);
        const ex2 = [30, 130, 30, 190];
        const eff2 = await this.eco.productionEfficiency(2);
        exData(ex2, eff2, 2);
        const exTeam = [140, 310, 180, 200];
        const aTeam = await this.eco.productionEfficiencyTeam([1, 2]);
        exData(exTeam, aTeam, 2);
    });

    it('01. Calculate NiOH Power', async function() {
        const self = this
        async function checkNiOHPower(stage) {
            const power = parseEther('1') * parseUnits(`${stage}`, 0) * parseUnits(`${stage}`, 0)
   
            const pAtk = power * (stage % 2 === 0 ? parseUnits('25', 0) : parseUnits('75', 0)) / parseUnits('100', 0);
            const rs = await self.eco.callNiOHPower(stage)
            log("\nSTAGE", stage, "POWER", Number(power/p16)/100.0)
            console.table([rs[0].map(t => Number(t/p16)/100.0), rs[1].map(t => Number(t/p16)/100.0)])
            expect(rs[2]).equal(power)
            expect(rs[0][stage % 5]).equal(pAtk)
            expect(rs[1][(stage + 1) % 5]).equal(power - pAtk)
        }
        await checkNiOHPower(1)
        await checkNiOHPower(2)
        await checkNiOHPower(3)
        await checkNiOHPower(4)
        await checkNiOHPower(5)
        await checkNiOHPower(6)
        
    })
});
