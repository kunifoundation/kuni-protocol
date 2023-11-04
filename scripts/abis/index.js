module.exports = {
  kuniItem: require('./KuniItem.json').abi,
  kuniSaru: require('./KuniSaru.json').abi,
  oldItem: require('./KuniItemmOld.json')
}

// async function addRoleMinterInv() {
//   const kuniItem = new Contract(TOKENS.kuniItem, ABI.kuniItem, wallet)
//   tx = await kuniItem.grantRole(await kuniItem.MINTER_ROLE(), '0x42B6c85d436Ad2bc958FeA609dE78DC0915E155B')
//   await tx.wait()
// }
