const {expect} = require("chai");
const {ethers} = require("hardhat");
const _ = require("lodash");
const {initPowerEffData, initCraftData, initSaruData, toByteByName} = require("../js-commons/ama-data");

const {parseEther, formatEther, deployContract, MaxUint256} = ethers;

const e100 = parseEther("100");
const e50 = parseEther("50");
const log = console.log;

describe("------------- Staking token ------------------", () => {
    let owner, bob, alex;
    let tx;
    before(async function () {
        // account init
        [owner, bob, alex, axi, ...addrs] = await ethers.getSigners();
        this.ow = owner;
        this.ore = await (await ethers.deployContract("Material", ["Ore", "ORE"])).waitForDeployment();
        this.stone = await (await ethers.deployContract("Material", ["Stone", "STONE"])).waitForDeployment();
        this.cotton = await (await ethers.deployContract("Material", ["Cotton", "COTTON"])).waitForDeployment();
        this.lumber = await (await ethers.deployContract("Material", ["Lumber", "LUMBER"])).waitForDeployment();
    });

    it("00. Check name Material", async function () {
        expect(await this.ore.name()).equal("Ore");
        expect(await this.stone.name()).equal("Stone");
        expect(await this.cotton.name()).equal("Cotton");
        expect(await this.lumber.name()).equal("Lumber");
    });
});
