const { boolean } = require('hardhat/internal/core/params/argumentTypes');

const mode = process.env.MODE
let envFile = '.env_testnet';
if (mode === 'mainnet') {
    envFile = '.env'
}
require('dotenv').config({path: envFile})

const IS_TESTNET = /^true$/i.test(process.env.IS_TESTNET);
const FOUNDATION_ADDR = process.env.FOUNDATION_ADDR;
const GENESIS_TIME = process.env.GENESIS_TIME; // 2024-01-03 10:00:00 GMT+07:00
const REF_ROOT = process.env.REF_ROOT;
const KUNI_SARU_ADDR = process.env.KUNI_SARU_ADDR;
const META_ITEM_URL = process.env.META_ITEM_URL;

module.exports = { 
    IS_TESTNET,
    FOUNDATION_ADDR, 
    GENESIS_TIME, // 2024-01-03 10:00:00 GMT+07:00
    REF_ROOT,
    KUNI_SARU_ADDR,
    META_ITEM_URL
}