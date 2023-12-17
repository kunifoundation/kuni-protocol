const {ethers: {getContractFactory}} = require("hardhat");
const TOKENS = require("./contract.json")

async function loadContract() {
    this.meta = (await (getContractFactory("MetaData"))).attach(TOKENS.metaData)
    this.eco = (await (getContractFactory("EcoGame"))).attach(TOKENS.ecoGame)

    this.game = (await (getContractFactory("AmaGame"))).attach(TOKENS.amaGame)
    this.inv = (await (getContractFactory("AmaInv"))).attach(TOKENS.amaInv)
    this.mining = (await (getContractFactory("MiningKuni"))).attach(TOKENS.kuni)
    this.scholarship = (await (getContractFactory("Scholarship"))).attach(TOKENS.scholarship)    
    this.referral = (await (getContractFactory("Referral"))).attach(TOKENS.referral)

    this.kuniItem = (await (getContractFactory("KuniItem"))).attach(TOKENS.kuniItem)
    this.kuniSaru = (await (getContractFactory("KuniSaru"))).attach(TOKENS.kuniSaru)

    this.ge = (await (getContractFactory("GreenEnergy"))).attach(TOKENS.ge)
    this.ore = (await (getContractFactory("Material"))).attach(TOKENS.ore)
    this.stone = (await (getContractFactory("Material"))).attach(TOKENS.stone)
    this.cotton = (await (getContractFactory("Material"))).attach(TOKENS.cotton)
    this.lumber = (await (getContractFactory("Material"))).attach(TOKENS.lumber)
    this.storeGame = (await (getContractFactory("StoreGame"))).attach(TOKENS.storeGame)
    return this;
}

module.exports = loadContract