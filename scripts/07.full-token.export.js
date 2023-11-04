const { writeWithToken } = require('../js-commons/io')
const tokens = require('./_v4')

const log = console.log

async function main() {
  writeWithToken(tokens, __filename, 1)
}

main().catch(err => log(err)).then(() => log('SUCCESS!'))