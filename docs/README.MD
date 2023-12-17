# Solidity API

## EcoGame

### MAGIC_NUM

```solidity
uint256 MAGIC_NUM
```

### K_BONUS

```solidity
uint256 K_BONUS
```

### MAX_BONUS

```solidity
uint256 MAX_BONUS
```

### MAGIC_BONUS

```solidity
uint256 MAGIC_BONUS
```

### constructor

```solidity
constructor(address _kuniMeta) public
```

### productionEfficiency

```solidity
function productionEfficiency(uint256 tokenId) external view returns (uint256 ore, uint256 stone, uint256 cotton, uint256 lumber)
```

### productionEfficiencyArr

```solidity
function productionEfficiencyArr(uint256 tokenId) external view returns (uint256[])
```

### _productionEfficiencyArr

```solidity
function _productionEfficiencyArr(uint256 tokenId) internal view returns (uint256[])
```

### productionEfficiencyTeam

```solidity
function productionEfficiencyTeam(uint256[] tokenIds) external view returns (uint256 ore, uint256 stone, uint256 cotton, uint256 lumber)
```

### niohPower

```solidity
function niohPower(uint256 stage) external pure returns (uint256)
```

### _niohPower

```solidity
function _niohPower(uint256 stage) internal pure returns (uint256)
```

### advantagePoint

```solidity
function advantagePoint(uint256[] tokenIds, address kuniItem, uint256[][] items, uint256 stage, uint256 bonus) external view returns (bool won, uint256 totalItem, uint256 power)
```

### _calPower

```solidity
function _calPower(uint256[] tokenIds, address kuniItem, uint256[][] items, uint256 stage, uint256 bonus, uint256 power) internal view returns (struct IData.NFTPartProp niohAttack, struct IData.NFTPartProp niohDefend, struct IData.NFTPartProp kuniAttack, struct IData.NFTPartProp kuniDefend, uint256 totalItem)
```

### _advantagePoint

```solidity
function _advantagePoint(struct IData.NFTPartProp _att, struct IData.NFTPartProp _de) internal pure returns (uint256 score)
```

### _calAdvantagePoint

```solidity
function _calAdvantagePoint(uint256 _attack, uint256 _defend) internal pure returns (uint256)
```

### materialStas

```solidity
function materialStas(uint256 _pic, uint256 qty) external view returns (uint256[])
```

### materialStasBatch

```solidity
function materialStasBatch(uint256[] _mPic, uint256[] qty) external view returns (uint256[])
```

### _primaryStat

```solidity
function _primaryStat(uint256[] items) internal pure returns (uint256 m1)
```

### _secondaryStat

```solidity
function _secondaryStat(uint256[] items, uint256 m1) internal pure returns (uint256 m2)
```

### _minorStat

```solidity
function _minorStat(uint256[] items, uint256 m1, uint256 m2) internal pure returns (uint256 m3)
```

### _toCraftNameCat

```solidity
function _toCraftNameCat(uint256[] items, uint256 attack) internal view returns (string name, uint256 cat)
```

### _materialStas

```solidity
function _materialStas(uint256 _material, uint256 qty) internal view returns (uint256[] prop)
```

### _materialStasBatch

```solidity
function _materialStasBatch(uint256[] _materials, uint256[] qty) internal view returns (uint256[] prop)
```

### battleBonusInc

```solidity
function battleBonusInc(uint256 cBonus) external pure returns (uint256 value)
```

### _calNioh

```solidity
function _calNioh(uint256 indx, uint256 power) internal pure returns (struct IData.NFTPartProp item)
```

### _createNioh

```solidity
function _createNioh(uint256 stage, uint256 power) internal pure returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend)
```

### callNiOHPower

```solidity
function callNiOHPower(uint256 stage) external pure returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend, uint256 power)
```

### _addBonus

```solidity
function _addBonus(struct IData.NFTPartProp v1, uint256 bonus) internal pure returns (struct IData.NFTPartProp)
```

### _plusProp

```solidity
function _plusProp(struct IData.NFTPartProp v1, struct IData.NFTPartProp v2) internal pure returns (struct IData.NFTPartProp result)
```

### getKuniItemPower

```solidity
function getKuniItemPower(address kuniItem, uint256[][] items) external view returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend, uint256 total)
```

### _getKuniItemPower

```solidity
function _getKuniItemPower(address kuniItem, uint256[][] items) internal view returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend, uint256 total)
```

### rewardPoint

```solidity
function rewardPoint(uint256 stage, bool won, uint256 saru, uint256 item) external pure returns (uint256)
```

### getContinentalMultiplierArr

```solidity
function getContinentalMultiplierArr(address acc) external view returns (uint256[])
```

### _getContinentalMultiplierArr

```solidity
function _getContinentalMultiplierArr(address acc) internal view returns (uint256[] lands)
```

### callCraft

```solidity
function callCraft(uint256[] _mPic, uint256[] amounts, uint256 cap, uint256 total, uint256 attack) external view returns (string name, uint256[] stats, uint256 cat)
```

### calProductivityTeam

```solidity
function calProductivityTeam(address sender, uint256[] tokenIds, uint256 kuniAmount) external view returns (uint256[])
```

### _calProductivity

```solidity
function _calProductivity(uint256 amount, uint256 tokenId) internal view returns (uint256[] eff)
```

## MetaData

### efficiencies

```solidity
mapping(uint256 => struct IData.KuniEfficiency) efficiencies
```

### sarus

```solidity
mapping(uint256 => uint256[]) sarus
```

### materials

```solidity
mapping(uint256 => uint256[]) materials
```

### itemCrafts

```solidity
mapping(uint256 => struct IData.ItemCraft) itemCrafts
```

### continents

```solidity
mapping(uint256 => mapping(uint256 => uint256)) continents
```

### addPower

```solidity
function addPower(uint256 prop, uint256[] _power) external
```

### _addPower

```solidity
function _addPower(uint256 prop, uint256[] _power) internal
```

### addPowerBatch

```solidity
function addPowerBatch(uint256[] props, uint256[][] _powers) external
```

### getPower

```solidity
function getPower(uint256 prop) external view returns (struct IData.NFTPartProp)
```

### getPowerTokenId

```solidity
function getPowerTokenId(uint256 tokenId) external view returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend, uint256 total)
```

### _powerTokenId

```solidity
function _powerTokenId(uint256 tokenId, struct IData.NFTPartProp attack, struct IData.NFTPartProp defend) internal view returns (struct IData.NFTPartProp, struct IData.NFTPartProp)
```

### getPowerTeam

```solidity
function getPowerTeam(uint256[] tokenIds) external view returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend, uint256 total)
```

### getPowerTeamNotTotal

```solidity
function getPowerTeamNotTotal(uint256[] tokenIds) external view returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend)
```

### addEfficiency

```solidity
function addEfficiency(uint256 prop, uint256[] eff) external
```

### _addEfficiency

```solidity
function _addEfficiency(uint256 prop, uint256[] eff) internal
```

### addEfficiencyBatch

```solidity
function addEfficiencyBatch(uint256[] effPro, uint256[][] effVals) external
```

### getEfficiency

```solidity
function getEfficiency(uint256 prop) external view returns (struct IData.KuniEfficiency)
```

### getEfficiencyTokenId

```solidity
function getEfficiencyTokenId(uint256 tokenId) external view returns (struct IData.KuniEfficiency efficiency)
```

### getEfficiencyTokenIds

```solidity
function getEfficiencyTokenIds(uint256[] tokenIds) external view returns (struct IData.KuniEfficiency efficiency)
```

### _efficiencyTokenId

```solidity
function _efficiencyTokenId(uint256 tokenId, struct IData.KuniEfficiency efficiency) internal view returns (struct IData.KuniEfficiency)
```

### getPowerAllTokenId

```solidity
function getPowerAllTokenId(uint256 tokenId) external view returns (struct IData.NFTPartProp power, uint256 total)
```

### getPowerAllTeam

```solidity
function getPowerAllTeam(uint256[] tokenIds) external view returns (struct IData.NFTPartProp power, uint256 total)
```

### addNft

```solidity
function addNft(uint256 _tokenId, uint256[] props) external
```

- _tokenId: tokenId[]
    - props: [[hand, weapon, head, eyes, body, hair, cat]]

### addNftBatch

```solidity
function addNftBatch(uint256[] tokenIds, uint256[][] props) external
```

### addMaterials

```solidity
function addMaterials(uint256[] pic, uint256[][] data) external
```

### materialBy

```solidity
function materialBy(uint256 _material) external view returns (uint256[] prop)
```

### itemMetaBy

```solidity
function itemMetaBy(uint256 _key) external view returns (string, uint256)
```

### addItemCraft

```solidity
function addItemCraft(string[] names, uint256[][] data) external
```

### _plusProp

```solidity
function _plusProp(struct IData.NFTPartProp v1, struct IData.NFTPartProp v2) internal pure returns (struct IData.NFTPartProp)
```

### _totalProps

```solidity
function _totalProps(struct IData.NFTPartProp v) internal pure returns (uint256)
```

### addContinental

```solidity
function addContinental(uint256 contin, uint256[] rates) external
```

### addContinentalMulBatch

```solidity
function addContinentalMulBatch(uint256[] contin, uint256[][] multipliers) external
```

### getContinentalMultiplier

```solidity
function getContinentalMultiplier(uint256 contin, uint256 _type) external view returns (uint256)
```

### _addContinentalMul

```solidity
function _addContinentalMul(uint256 contin, uint256[] multipliers) internal
```

## StoreGame

### coreGame

```solidity
address coreGame
```

### invGame

```solidity
address invGame
```

### stageOf

```solidity
function stageOf(address player) external view returns (uint256)
```

### battleBonusOf

```solidity
function battleBonusOf(address player) external view returns (uint256)
```

### currentCapOf

```solidity
function currentCapOf(address player) external view returns (uint256)
```

### _capOf

```solidity
function _capOf(address player) internal view returns (uint256)
```

### playInfo

```solidity
function playInfo(address player) external view returns (uint256 cap, uint256 bonus, uint256 stage)
```

### updateGame

```solidity
function updateGame(address core, address inv) external
```

## AmaGame

### MAGIC_NUM

```solidity
uint256 MAGIC_NUM
```

### PERCENT

```solidity
uint256 PERCENT
```

### kuniStakedOf

```solidity
mapping(address => uint256) kuniStakedOf
```

### getMaterials

```solidity
address[] getMaterials
```

### userInfo

```solidity
mapping(address => mapping(address => struct IAmaGame.UserInfo)) userInfo
```

### pools

```solidity
mapping(address => struct IAmaGame.PoolInfo) pools
```

### kuniSaru

```solidity
address kuniSaru
```

### kuniItem

```solidity
address kuniItem
```

### eco

```solidity
contract IEcoGame eco
```

### scholar

```solidity
contract IScholarship scholar
```

### miningKuni

```solidity
address miningKuni
```

### ge

```solidity
address ge
```

### referral

```solidity
address referral
```

### unclaimedGE

```solidity
mapping(address => uint256) unclaimedGE
```

### getGenesisTime

```solidity
uint256 getGenesisTime
```

### constructor

```solidity
constructor(uint256 genesisTime_, address miningAddr_, address kuniSaru_, address kuniItem_, address eco_, address scholar_, address referral_, address ge_, address foundation_) public
```

### deposit

```solidity
function deposit(uint256 kuniAmount, uint256[] tokenIds) external
```

### _mUpdateAmount

```solidity
function _mUpdateAmount(address mToken, uint256 amount) internal
```

### claim

```solidity
function claim() external
```

### withdrawTokens

```solidity
function withdrawTokens(uint256 kuniAmount, uint256[] tokenIds) external
```

### withdraw

```solidity
function withdraw() external
```

### fighting

```solidity
function fighting(uint256[] tokenIds, uint256[][] itemIds) external
```

### fightingAndEarn

```solidity
function fightingAndEarn(uint256[] tokenIds, uint256[][] itemIds) external
```

### _fighting

```solidity
function _fighting(uint256[] tokenIds, uint256[][] itemIds) internal
```

### claimGE

```solidity
function claimGE() external
```

### earnKuni

```solidity
function earnKuni() external
```

### _earnKuni

```solidity
function _earnKuni(address sender) internal
```

### _battleKuni

```solidity
function _battleKuni(uint256[] tokenIds, uint256[][] itemIds) internal
```

### _shareReward

```solidity
function _shareReward(uint256 reward, uint256[] tokenIds, uint256[][] itemIds, uint256 totalItem) internal returns (uint256)
```

### _invalidSaru

```solidity
function _invalidSaru(uint256[] tokenIds) internal view
```

### _invalidKuniItem

```solidity
function _invalidKuniItem(uint256[][] itemIds) internal view
```

### _equipmentCorrect

```solidity
function _equipmentCorrect(address owner, uint256 tokenId, uint256 cat) internal view
```

### tokensBy

```solidity
function tokensBy(address account) external view returns (uint256[] nfts)
```

### tokenIdOf

```solidity
function tokenIdOf(address account, uint256 index) external view returns (uint256)
```

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

### saruStakeOf

```solidity
function saruStakeOf(address sender, uint256 start, uint256 limit) external view virtual returns (uint256[], address[])
```

### stageOf

```solidity
function stageOf(address player) external view returns (uint256)
```

### battleBonusOf

```solidity
function battleBonusOf(address player) external view returns (uint256)
```

### _mUpdatePool

```solidity
function _mUpdatePool(address mToken) internal
```

### _harvest

```solidity
function _harvest(address mToken, struct IAmaGame.UserInfo user) internal
```

### _mClaim

```solidity
function _mClaim(address mToken) internal
```

### pendingReward

```solidity
function pendingReward(address mToken, address sender) external view returns (uint256)
```

### geStakedOf

```solidity
function geStakedOf(address mToken, address sender) external view returns (uint256)
```

### _addToken

```solidity
function _addToken(address _from, uint256 _tokenId) internal
```

### _removeToken

```solidity
function _removeToken(address _from, uint256 _tokenId) internal
```

### _transfer

```solidity
function _transfer(address _from, address _to, uint256 _tokenId) internal
```

### _transferToken

```solidity
function _transferToken(address mToken, uint256 amount) internal
```

### setEco

```solidity
function setEco(address addr) external
```

### setFoundation

```solidity
function setFoundation(address foundation_) external
```

### setMaterials

```solidity
function setMaterials(address[] tokens) external
```

### setGenesisTime

```solidity
function setGenesisTime(uint256 _start) external
```

### onlyStart

```solidity
modifier onlyStart()
```

### onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) public virtual returns (bytes4)
```

## AmaInv

### materialPic

```solidity
mapping(address => uint256) materialPic
```

### currentCap

```solidity
mapping(address => uint256) currentCap
```

### CAP_INIT

```solidity
uint256 CAP_INIT
```

### STEP

```solidity
uint256 STEP
```

### kuniItem

```solidity
address kuniItem
```

### miningKuni

```solidity
address miningKuni
```

### constructor

```solidity
constructor(address miningAddr_, address eco_, address kuniItem_) public
```

### craft

```solidity
function craft(address[] _materials, uint256[] amounts, uint8 cType) external
```

### _craft

```solidity
function _craft(address[] addr, uint256[] amounts, uint8 attack) internal
```

### _currentCapOf

```solidity
function _currentCapOf(address acc) internal view returns (uint256)
```

### setMaterialPic

```solidity
function setMaterialPic(address[] materialAddr, uint256[] pic) external
```

### setEco

```solidity
function setEco(address eco_) external
```

### currentCapOf

```solidity
function currentCapOf(address acc) external view returns (uint256)
```

## MiningKuni

### UserInfo

```solidity
struct UserInfo {
  uint256 amount;
  uint256 rewardDebt;
  uint256 pendingReward;
}
```

### PoolInfo

```solidity
struct PoolInfo {
  uint256 gasUsed;
  uint256 rewardPerShare;
  uint256 lastRewardBlock;
  struct EnumerableSet.AddressSet minters;
}
```

### MAX_SUPPLY

```solidity
uint256 MAX_SUPPLY
```

### NUM_OF_BLOCK_PER_DAY

```solidity
uint256 NUM_OF_BLOCK_PER_DAY
```

### MAGIC_NUM

```solidity
uint256 MAGIC_NUM
```

### RATE

```solidity
uint256 RATE
```

### BASE_RATE

```solidity
uint256 BASE_RATE
```

### BLOCK_LIMIT

```solidity
uint256 BLOCK_LIMIT
```

### userInfo

```solidity
mapping(address => mapping(address => struct MiningKuni.UserInfo)) userInfo
```

### totalGasUsed

```solidity
uint256 totalGasUsed
```

### gasTemp

```solidity
mapping(address => uint256) gasTemp
```

### picGE

```solidity
mapping(address => address) picGE
```

### geSupported

```solidity
mapping(address => bool) geSupported
```

### kuniBlock

```solidity
uint256 kuniBlock
```

### MineKuni

```solidity
event MineKuni(address user, address ge, uint256 amount)
```

### ClaimKuni

```solidity
event ClaimKuni(address user, address ge, uint256 amount)
```

### getPoolReward

```solidity
function getPoolReward(address _ge) public view returns (uint256)
```

### _harvest

```solidity
function _harvest(address _ge, address sender) internal
```

### mineKuni

```solidity
function mineKuni(address _ge, uint256 _amount) external
```

### mineKuniFrom

```solidity
function mineKuniFrom(address sender, address _ge, uint256 _amount) external
```

### _mineKuni

```solidity
function _mineKuni(address _ge, address sender, uint256 _amount) internal
```

### claimKuni

```solidity
function claimKuni(address _ge, uint256 _amount) external
```

### geStakedOf

```solidity
function geStakedOf(address _ge, address acc) external view returns (uint256)
```

### _gasStart

```solidity
function _gasStart() internal
```

### _gasEnd

```solidity
function _gasEnd() internal
```

### getPoolsLength

```solidity
function getPoolsLength() public view returns (uint256)
```

### getPools

```solidity
function getPools() external view returns (address[])
```

### getPoolInfo

```solidity
function getPoolInfo(address _ge) public view returns (uint256, uint256, uint256)
```

### pendingReward

```solidity
function pendingReward(address _ge, address sender) external view returns (uint256)
```

### addPool

```solidity
function addPool(address _ge, address[] minters) external
```

### addCoreGame

```solidity
function addCoreGame(address gameAddr) external
```

### removeCoreGame

```solidity
function removeCoreGame(address gameAddr) external
```

### removePool

```solidity
function removePool(address _ge) external
```

### _geSupport

```solidity
modifier _geSupport(address ge)
```

### _onlyCoreGame

```solidity
modifier _onlyCoreGame()
```

### testGas

```solidity
function testGas() external
```

### gasStart

```solidity
function gasStart() external
```

### gasEnd

```solidity
function gasEnd() external
```

## Referral

### _ref

```solidity
mapping(address => struct IReferral.Ref) _ref
```

### refOwner

```solidity
mapping(string => struct IReferral.Ref) refOwner
```

### userOfCodes

```solidity
mapping(address => string[]) userOfCodes
```

### codeOfUsers

```solidity
mapping(string => address[]) codeOfUsers
```

### userRefCode

```solidity
mapping(address => string) userRefCode
```

### EXTRA

```solidity
uint256 EXTRA
```

### PERCENT

```solidity
uint256 PERCENT
```

### ROOT_CODE

```solidity
string ROOT_CODE
```

### RATE_BASE

```solidity
uint256 RATE_BASE
```

### constructor

```solidity
constructor(address _rootAddr, string _rootCode) public
```

### refPoint

```solidity
function refPoint(address sender, uint256 point) external view returns (uint256, uint256, address)
```

### applyCode

```solidity
function applyCode(string code) external
```

### applyCreateCode

```solidity
function applyCreateCode(string code, string _myCode) external
```

### _applyCode

```solidity
function _applyCode(string code) internal
```

### createCode

```solidity
function createCode(string code, uint256 rate) external
```

### _createCode

```solidity
function _createCode(address to, string code, uint256 rate) internal
```

### setExtra

```solidity
function setExtra(uint256 extral) external
```

### balanceCodeOf

```solidity
function balanceCodeOf(string code) external view returns (uint256)
```

### balanceUserOf

```solidity
function balanceUserOf(address addr) external view returns (uint256)
```

### codesOf

```solidity
function codesOf(address addr) external view returns (string[])
```

### codeRefOf

```solidity
function codeRefOf(string code) external view returns (address[])
```

## Scholarship

### PERCENT

```solidity
uint256 PERCENT
```

### ScholarInfo

```solidity
struct ScholarInfo {
  address owner;
  uint256 rate;
}
```

### rateOf

```solidity
mapping(address => mapping(uint256 => struct Scholarship.ScholarInfo)) rateOf
```

### ask

```solidity
function ask(address nftAddr, uint256 tokenId, uint256 rate) external
```

### cancel

```solidity
function cancel(address nftAddr, uint256 tokenId) external
```

### askBatch

```solidity
function askBatch(address nftAddr, uint256[] tokenIds, uint256[] arrRate) external
```

### cancelBatch

```solidity
function cancelBatch(address nftAddr, uint256[] tokenIds) external
```

### _ask

```solidity
function _ask(address nftAddr, uint256 tokenId, uint256 rate) internal
```

### _cancel

```solidity
function _cancel(address nftAddr, uint256 tokenId) internal
```

### _deleteToken

```solidity
function _deleteToken(address nftAddr, uint256 tokenId) internal
```

### ownerInfo

```solidity
function ownerInfo(address nftAddr, uint256 tokenId) external view returns (address, uint256)
```

### allOf

```solidity
function allOf(address nftAddr) external view returns (uint256[])
```

### valuesOf

```solidity
function valuesOf(address nftAddr, address sender) external view returns (uint256[])
```

### at

```solidity
function at(address nftAddr, address sender, uint256 index) external view returns (uint256)
```

### balanceOf

```solidity
function balanceOf(address nftAddr, address sender) external view returns (uint256)
```

### _getTokenIdAt

```solidity
function _getTokenIdAt(address nftAddr, address sender, uint256 index) internal view returns (uint256)
```

### getScholars

```solidity
function getScholars(address nftAddr, address sender, uint256 start, uint256 limit) external view virtual returns (uint256[], address[], uint256[])
```

### transferOwner

```solidity
function transferOwner(address nftAddr, uint256[] tokenIds, address newOwner) external
```

### onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) public virtual returns (bytes4)
```

## IAmaGame

### Deposit

```solidity
event Deposit(address user, uint256[] tokenIds, uint256 kuni)
```

### Claim

```solidity
event Claim(address user)
```

### WithdrawTokens

```solidity
event WithdrawTokens(address user, uint256 amount, uint256[] tokenIds)
```

### Withdraw

```solidity
event Withdraw(address user, uint256 kuni)
```

### Fighting

```solidity
event Fighting(address user, uint256[] tokenIds, uint256[][] itemIds, uint256 ge, uint256 power, bool won)
```

### ClaimGE

```solidity
event ClaimGE(address user, uint256 amount)
```

### EarnKuni

```solidity
event EarnKuni(address user, uint256 amount)
```

### deposit

```solidity
function deposit(uint256 kuni, uint256[] tokenIds) external
```

### claim

```solidity
function claim() external
```

### withdrawTokens

```solidity
function withdrawTokens(uint256 kuni, uint256[] tokenIds) external
```

### withdraw

```solidity
function withdraw() external
```

### fighting

```solidity
function fighting(uint256[] tokenIds, uint256[][] itemIds) external
```

### claimGE

```solidity
function claimGE() external
```

### stageOf

```solidity
function stageOf(address player) external view returns (uint256)
```

### battleBonusOf

```solidity
function battleBonusOf(address player) external view returns (uint256)
```

### UserInfo

```solidity
struct UserInfo {
  uint256 amount;
  uint256 pendingReward;
  uint256 rewardDebt;
}
```

### PoolInfo

```solidity
struct PoolInfo {
  address token;
  uint256 supply;
  uint256 lastRewardBlock;
  uint256 rewardPerShare;
}
```

## IAmaInv

### Craft

```solidity
event Craft(address, uint256)
```

### craft

```solidity
function craft(address[] tokens, uint256[] amounts, uint8 cType) external
```

### currentCapOf

```solidity
function currentCapOf(address acc) external view returns (uint256)
```

## IData

### ItemCraft

```solidity
struct ItemCraft {
  string name;
  uint256 cat;
}
```

### NFTPartProp

```solidity
struct NFTPartProp {
  uint256 slash;
  uint256 heavy;
  uint256 strike;
  uint256 tech;
  uint256 magic;
  uint256 cat;
}
```

### KuniEfficiency

```solidity
struct KuniEfficiency {
  uint256 ore;
  uint256 stone;
  uint256 cotton;
  uint256 lumber;
}
```

## IERC20Burnable

### burn

```solidity
function burn(uint256 amount) external
```

### burnFrom

```solidity
function burnFrom(address account, uint256 amount) external
```

## IERC20Mint

### mint

```solidity
function mint(address account, uint256 amount) external
```

## IERC721Mint

### safeMint

```solidity
function safeMint(address to, string name, uint256[] meta, uint256 cat) external
```

### currentId

```solidity
function currentId(uint256 eType) external view returns (uint256)
```

### getMeta

```solidity
function getMeta(uint256 tokenId) external view returns (string name, uint256 slash, uint256 heavy, uint256 strike, uint256 tech, uint256 magic, uint256 cat)
```

## IEcoGame

### productionEfficiency

```solidity
function productionEfficiency(uint256 tokenId) external view returns (uint256 ore, uint256 stone, uint256 cotton, uint256 lumber)
```

### productionEfficiencyArr

```solidity
function productionEfficiencyArr(uint256 tokenId) external view returns (uint256[])
```

### productionEfficiencyTeam

```solidity
function productionEfficiencyTeam(uint256[] tokenIds) external view returns (uint256 ore, uint256 stone, uint256 cotton, uint256 lumber)
```

### materialStas

```solidity
function materialStas(uint256 pic, uint256 qty) external view returns (uint256[])
```

### materialStasBatch

```solidity
function materialStasBatch(uint256[] _materials, uint256[] qty) external view returns (uint256[])
```

### callCraft

```solidity
function callCraft(uint256[] _mPic, uint256[] amounts, uint256 cap, uint256 total, uint256 attack) external view returns (string name, uint256[] stats, uint256 cat)
```

### niohPower

```solidity
function niohPower(uint256 stage) external view returns (uint256)
```

### advantagePoint

```solidity
function advantagePoint(uint256[] tokenIds, address kuniItem, uint256[][] items, uint256 stage, uint256 bonus) external view returns (bool won, uint256 totalItem, uint256 power)
```

### rewardPoint

```solidity
function rewardPoint(uint256 stage, bool won, uint256 saru, uint256 item) external view returns (uint256)
```

### battleBonusInc

```solidity
function battleBonusInc(uint256 cBonus) external view returns (uint256 value)
```

### getContinentalMultiplierArr

```solidity
function getContinentalMultiplierArr(address acc) external view returns (uint256[])
```

### calProductivityTeam

```solidity
function calProductivityTeam(address sender, uint256[] tokenIds, uint256 kuniAmount) external view returns (uint256[])
```

## IMaterial

### getRewardForMiner

```solidity
function getRewardForMiner(uint256 _from, uint256 _to) external view returns (uint256)
```

## IMetaData

### addPower

```solidity
function addPower(uint256 prop, uint256[] _power) external
```

### addPowerBatch

```solidity
function addPowerBatch(uint256[] props, uint256[][] data) external
```

### getPower

```solidity
function getPower(uint256 prop) external view returns (struct IData.NFTPartProp)
```

### getPowerTokenId

```solidity
function getPowerTokenId(uint256 tokenId) external view returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend, uint256 total)
```

### getPowerTeam

```solidity
function getPowerTeam(uint256[] tokenIds) external view returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend, uint256 total)
```

### getPowerTeamNotTotal

```solidity
function getPowerTeamNotTotal(uint256[] tokenIds) external view returns (struct IData.NFTPartProp attack, struct IData.NFTPartProp defend)
```

### getPowerAllTokenId

```solidity
function getPowerAllTokenId(uint256 tokenId) external view returns (struct IData.NFTPartProp power, uint256 total)
```

### getPowerAllTeam

```solidity
function getPowerAllTeam(uint256[] tokenIds) external view returns (struct IData.NFTPartProp power, uint256 total)
```

### addEfficiency

```solidity
function addEfficiency(uint256 prop, uint256[] eff) external
```

### addEfficiencyBatch

```solidity
function addEfficiencyBatch(uint256[] effPro, uint256[][] effVals) external
```

### getEfficiency

```solidity
function getEfficiency(uint256 prop) external view returns (struct IData.KuniEfficiency efficiency)
```

### getEfficiencyTokenId

```solidity
function getEfficiencyTokenId(uint256 tokenId) external view returns (struct IData.KuniEfficiency efficiency)
```

### getEfficiencyTokenIds

```solidity
function getEfficiencyTokenIds(uint256[] tokenIds) external view returns (struct IData.KuniEfficiency efficiency)
```

### addNft

```solidity
function addNft(uint256 _tokenId, uint256[] props) external
```

### addNftBatch

```solidity
function addNftBatch(uint256[] tokenIds, uint256[][] props) external
```

### addMaterials

```solidity
function addMaterials(uint256[] pic, uint256[][] data) external
```

### materialBy

```solidity
function materialBy(uint256 pic) external view returns (uint256[] prop)
```

### itemMetaBy

```solidity
function itemMetaBy(uint256 _key) external view returns (string, uint256)
```

### addItemCraft

```solidity
function addItemCraft(string[] names, uint256[][] data) external
```

### getContinentalMultiplier

```solidity
function getContinentalMultiplier(uint256 contin, uint256 _type) external view returns (uint256)
```

## IMiningKuni

### gasStart

```solidity
function gasStart() external
```

### gasEnd

```solidity
function gasEnd() external
```

### mineKuni

```solidity
function mineKuni(address _ge, uint256 _amount) external
```

### mineKuniFrom

```solidity
function mineKuniFrom(address sender, address _ge, uint256 _amount) external
```

### claimKuni

```solidity
function claimKuni(address _ge, uint256 _amount) external
```

### geStakedOf

```solidity
function geStakedOf(address _ge, address acc) external view returns (uint256)
```

## IReferral

### Ref

```solidity
struct Ref {
  address ref;
  uint256 rate;
}
```

### CodeCreated

```solidity
event CodeCreated(address referrer, string code, uint256 rate)
```

### CodeApplied

```solidity
event CodeApplied(address user, string code, address referrer, uint256 rate)
```

### CodeAppliedCreated

```solidity
event CodeAppliedCreated(address user, string code, string myCode, uint256 rate)
```

### refPoint

```solidity
function refPoint(address, uint256) external view returns (uint256, uint256, address)
```

## IScholarship

### Ask

```solidity
event Ask(address nftAddr, address owner, uint256 tokenId, uint256 rate)
```

### AskBatch

```solidity
event AskBatch(address owner, address nftAddr, uint256[] tokenIds, uint256[] arrRate)
```

### Cancel

```solidity
event Cancel(address nftAddr, address sender, uint256 tokenId)
```

### CancelBatch

```solidity
event CancelBatch(address nftAddr, address sender, uint256[] tokenIds)
```

### ask

```solidity
function ask(address nftAddr, uint256 tokenId, uint256 rate) external
```

### cancel

```solidity
function cancel(address nftAddr, uint256 tokenId) external
```

### ownerInfo

```solidity
function ownerInfo(address nftAddr, uint256 tokenId) external view returns (address, uint256)
```

### cancelBatch

```solidity
function cancelBatch(address nftAddr, uint256[] tokenIds) external
```

### askBatch

```solidity
function askBatch(address nftAddr, uint256[] tokenIds, uint256[] arrRate) external
```

## IStoreGame

### stageOf

```solidity
function stageOf(address player) external view returns (uint256)
```

### battleBonusOf

```solidity
function battleBonusOf(address player) external view returns (uint256)
```

### currentCapOf

```solidity
function currentCapOf(address player) external view returns (uint256)
```

## GreenEnergy

### mint

```solidity
function mint(address to, uint256 amount) external
```

### burn

```solidity
function burn(uint256 amount) external virtual
```

### burnFrom

```solidity
function burnFrom(address account, uint256 amount) external virtual
```

### onlyMinter

```solidity
modifier onlyMinter()
```

### addMinter

```solidity
function addMinter(address minter_) public
```

### removeMinter

```solidity
function removeMinter(address minter_) public
```

### getMinters

```solidity
function getMinters() external view returns (address[])
```

## Material

### MAX_SUPPLY

```solidity
uint256 MAX_SUPPLY
```

### NUM_OF_BLOCK_PER_DAY

```solidity
uint256 NUM_OF_BLOCK_PER_DAY
```

### RATE

```solidity
uint256 RATE
```

### BASE_RATE

```solidity
uint256 BASE_RATE
```

### minter

```solidity
address minter
```

### constructor

```solidity
constructor(string name_, string symbol_) public
```

### mint

```solidity
function mint(address to, uint256 amount) external
```

### getRewardForMiner

```solidity
function getRewardForMiner(uint256 _from, uint256 _to) external view returns (uint256)
```

### onlyMinter

```solidity
modifier onlyMinter()
```

### addMinter

```solidity
function addMinter(address minter_) public
```

### removeMinter

```solidity
function removeMinter(address minter_) public
```

### getMinters

```solidity
function getMinters() external view returns (address[])
```

## KuniItem

### Meta

```solidity
struct Meta {
  string name;
  uint256 slash;
  uint256 heavy;
  uint256 strike;
  uint256 tech;
  uint256 magic;
  uint256 cat;
}
```

### lastTokenIdOf

```solidity
mapping(uint256 => uint256) lastTokenIdOf
```

### Mint

```solidity
event Mint(address owner, uint256 tokenId)
```

### UpdateName

```solidity
event UpdateName(uint256 tokenId, string name)
```

### currentId

```solidity
function currentId(uint256 eType) external view returns (uint256)
```

### safeMint

```solidity
function safeMint(address to, string name, uint256[] meta, uint256 cat) external
```

### getMeta

```solidity
function getMeta(uint256 tokenId) external view returns (string name, uint256 slash, uint256 heavy, uint256 strike, uint256 tech, uint256 magic, uint256 cat)
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

### setBaseUrl

```solidity
function setBaseUrl(string _uri) external
```

### _baseURI

```solidity
function _baseURI() internal view returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

### onlyMinter

```solidity
modifier onlyMinter()
```

### addMinter

```solidity
function addMinter(address minter_) public
```

### removeMinter

```solidity
function removeMinter(address minter_) public
```

### getMinters

```solidity
function getMinters() external view returns (address[])
```

## KuniSaru

### constructor

```solidity
constructor() public
```

### pause

```solidity
function pause() external
```

### unpause

```solidity
function unpause() external
```

### safeMint

```solidity
function safeMint(address to) external
```

### setBaseUrl

```solidity
function setBaseUrl(string _uri) external
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

### _baseURI

```solidity
function _baseURI() internal view returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

