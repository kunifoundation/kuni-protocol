// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IAmaGame.sol";
import "../interfaces/IEcoGame.sol";
import "../interfaces/IMaterial.sol";
import "../interfaces/IMiningKuni.sol";
import "../interfaces/IReferral.sol";
import "../interfaces/IScholarship.sol";

contract AmaGame is IAmaGame, Ownable, Pausable, IERC721Receiver, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => uint256) private _battleBonus;
    mapping(address => uint256) private stages;

    uint256 MAGIC_NUM = 1e12;
    uint256 private MAX_SARU = 6;
    // owner => tokenIds
    mapping(address => EnumerableSet.UintSet) private _nftSaru;
    // tokenId => owner
    mapping(uint256 => address) private _nftOwner;
    mapping(address => uint256) public kuniStakedOf;

    address[] private _materials = new address[](4);
    // material token => user addr => info
    mapping(address => mapping(address => UserInfo)) public userInfo;
    // material token => pool
    mapping(address => PoolInfo) public pools;

    address public kuniSaru;
    address public kuniItem;
    address private foundation;
    IEcoGame public eco;
    IScholarship public scholar;
    address public miningKuni;
    address public ge;
    address public referral;
    mapping(address => uint256) public unclaimedGE;
    uint256 genesisTime;

    constructor(
        address kuniSaru_,
        address kuniItem_,
        address eco_,
        address scholar_,
        address refer,
        uint256 _genesisTime
    ) {
        kuniSaru = kuniSaru_;
        kuniItem = kuniItem_;
        eco = IEcoGame(eco_);
        scholar = IScholarship(scholar_);
        referral = refer;
        genesisTime = _genesisTime;
    }

    function deposit(uint256 kuniAmount, uint256[] calldata tokenIds) external override nonReentrant {
        uint256[] memory mValues = new uint256[](4);
        uint256[] memory eff = new uint256[](4);
        // Update old data
        if (kuniAmount > 0) {
            // call
            eff = _calProductivityTeam(kuniAmount, _nftSaru[msg.sender].values());
            for (uint256 index = 0; index < eff.length; index++) {
                mValues[index] = mValues[index].add(eff[index]);
            }
            // kuni staked
            IERC20(miningKuni).transferFrom(msg.sender, address(this), kuniAmount);
            kuniStakedOf[msg.sender] = kuniStakedOf[msg.sender].add(kuniAmount);
        }

        if (tokenIds.length > 0) {
            eff = _calProductivityTeam(kuniStakedOf[msg.sender], tokenIds);
            for (uint256 index = 0; index < eff.length; index++) {
                mValues[index] = mValues[index].add(eff[index]);
            }

            for (uint256 index = 0; index < tokenIds.length; index++) {
                _transfer(msg.sender, address(this), tokenIds[index]);
            }
        }
        uint256[] memory multipliers = eco.getContinentalMultiplierArr(msg.sender);
        // Update value
        for (uint256 inx = 0; inx < _materials.length; inx++) {
            require(_materials[inx] != address(0x0), "KUNI: Material not yet initialized");
            _mDeposit(_materials[inx], msg.sender, mValues[inx] + kuniAmount, multipliers[inx]);
        }
    }

    function _calProductivityTeam(uint256 amount, uint256[] memory tokenIds) internal view returns (uint256[] memory) {
        uint256[] memory mValues = new uint256[](4);
        for (uint256 index = 0; index < tokenIds.length; index++) {
            uint256[] memory eff = _calProductivity(amount, tokenIds[index]);
            for (uint256 j = 0; j < eff.length; j++) {
                mValues[j] = mValues[j].add(eff[j]);
            }
        }
        return mValues;
    }

    function _calProductivity(uint256 amount, uint256 tokenId) internal view returns (uint256[] memory eff) {
        eff = eco.productionEfficiencyArr(tokenId);
        uint256 total = 0;
        for (uint256 index = 0; index < eff.length; index++) {
            total = total.add(eff[index]);
        }

        for (uint256 index = 0; index < eff.length; index++) {
            eff[index] = eff[index].mul(MAGIC_NUM).div(total).mul(amount).div(MAGIC_NUM);
        }
    }

    function claim() external override nonReentrant {
        for (uint256 inx = 0; inx < _materials.length; inx++) {
            require(_materials[inx] != address(0x0), "KUNI: Material is not initial");
            _mClaim(_materials[inx], msg.sender);
        }
    }

    function withdrawTokens(uint256 kuniAmount, uint256[] calldata tokenIds) external override nonReentrant {
        require(kuniAmount <= kuniStakedOf[msg.sender], "KUNI: Exceeded!");
        uint256[] memory mValues = new uint256[](4);
        uint256[] memory calValues = new uint256[](4);

        if (tokenIds.length > 0) {
            // saru withdraw
            mValues = _calProductivityTeam(kuniStakedOf[msg.sender], tokenIds);
            for (uint256 inx = 0; inx < tokenIds.length; inx++) {
                require(msg.sender == _nftOwner[tokenIds[inx]], "KUNI: Your is not owner");
                _transfer(address(this), msg.sender, tokenIds[inx]);
            }
        }

        if (kuniAmount > 0) {
            // nft staked
            calValues = _calProductivityTeam(kuniAmount, _nftSaru[msg.sender].values());
            for (uint256 index = 0; index < calValues.length; index++) {
                mValues[index] = mValues[index].add(calValues[index]);
            }
            _transferToken(miningKuni, kuniAmount);
            kuniStakedOf[msg.sender] = kuniStakedOf[msg.sender].sub(kuniAmount);
        }

        uint256[] memory multipliers = eco.getContinentalMultiplierArr(msg.sender);
        for (uint256 inx = 0; inx < _materials.length; inx++) {
            require(_materials[inx] != address(0x0), "KUNI: Material is not initial");
            _mWithdraw(_materials[inx], msg.sender, mValues[inx].add(kuniAmount), multipliers[inx]);
        }
    }

    function withdraw() external override nonReentrant {
        for (uint256 inx = 0; inx < _materials.length; inx++) {
            require(_materials[inx] != address(0x0), "KUNI: Material is not initial");
            _mWithdraw(_materials[inx]);
        }

        // widthraw saru staked
        for (uint256 inx = _nftSaru[msg.sender].length(); inx > 0; inx--) {
            _transfer(address(this), msg.sender, _nftSaru[msg.sender].at(inx - 1));
        }

        if (kuniStakedOf[msg.sender] > 0) {
            _transferToken(miningKuni, kuniStakedOf[msg.sender]);
            kuniStakedOf[msg.sender] = 0;
        }
    }

    function fighting(
        uint256[] calldata tokenIds,
        uint256[][] calldata itemIds
    ) external override nonReentrant onlyStart {
        if (miningKuni != address(0x0)) {
            IMiningKuni(miningKuni).gasStart();
        }
        require(itemIds.length <= tokenIds.length && tokenIds.length <= MAX_SARU, "KUNI: Unable to process request");
        _invalidSaru(tokenIds, msg.sender);
        _invalidKuniItem(itemIds, msg.sender);
        _fighting(tokenIds, itemIds);
        if (miningKuni != address(0x0)) {
            IMiningKuni(miningKuni).gasEnd();
        }
    }

    function claimGE() external override nonReentrant {
        _claimGE(msg.sender);
        if (foundation != address(0x0)) {
            _claimGE(foundation);
        }
    }

    function earnKuni() external nonReentrant {
        _earnKuni(msg.sender);
        if (foundation != address(0x0)) {
            _earnKuni(foundation);
        }
    }

    function _earnKuni(address sender) internal {
        if (ge == address(0x0)) return;
        uint256 amount = unclaimedGE[sender];
        if (amount > 0) {
            if (miningKuni == address(0x0)) {
                IMaterial(ge).mint(sender, amount);
                emit ClaimGE(sender, amount);
            } else {
                IMaterial(ge).mint(miningKuni, amount);
                IMiningKuni(miningKuni).mineKuniFrom(sender, ge, amount);
                emit EarnKuni(sender, amount);
            }
            unclaimedGE[sender] = 0;
        }
    }

    function _claimGE(address sender) internal {
        if (ge == address(0x0)) return;
        uint256 amount = unclaimedGE[sender];
        if (amount > 0) {
            IMaterial(ge).mint(sender, amount);
            unclaimedGE[sender] = 0;
        }
        emit ClaimGE(sender, amount);
    }

    function _fighting(uint256[] calldata tokenIds, uint256[][] calldata itemIds) internal {
        if (stages[msg.sender] == 0) {
            stages[msg.sender] = 1;
        }

        uint256 reward = 0;
        uint256 niohPower = eco.niohPower(stages[msg.sender]);
        (bool won, uint256 totalItem) = eco.advantagePoint(
            tokenIds,
            kuniItem,
            itemIds,
            stages[msg.sender],
            _battleBonus[msg.sender],
            niohPower
        );
        reward = eco.rewardPoint(stages[msg.sender], won, tokenIds.length, totalItem);
        if (won) {
            stages[msg.sender] = stages[msg.sender] + 1;
        }
        uint256 myReward = _shareReward(reward, tokenIds, itemIds, totalItem);
        unclaimedGE[msg.sender] += myReward;
        emit Fighting(msg.sender, tokenIds, itemIds, myReward, niohPower, won);
        _updateBattleBonus();
    }

    function _updateBattleBonus() internal {
        (uint256 bonus, ) = eco.battleBonusInc(_battleBonus[msg.sender]);
        _battleBonus[msg.sender] = bonus;
    }

    function _shareReward(
        uint256 reward,
        uint256[] calldata tokenIds,
        uint256[][] calldata itemIds,
        uint256 totalItem
    ) internal returns (uint256) {
        if (referral != address(0x0)) {
            address refOwner;
            uint256 refReward;
            (reward, refReward, refOwner) = IReferral(referral).refPoint(msg.sender, reward);
            if (refOwner != address(0x0) && refReward > 0) {
                unclaimedGE[refOwner] += refReward;
            }
        }

        uint256 myReward = reward;
        uint256 perReward = reward.div(tokenIds.length + totalItem);
        // share saru
        for (uint256 inx = 0; inx < tokenIds.length; inx++) {
            (address owner, uint256 percent) = scholar.ownerInfo(kuniSaru, tokenIds[inx]);
            if (owner == msg.sender || owner == address(0x0)) continue;
            uint256 saruScholarFee = perReward.mul(percent).div(10000);
            unclaimedGE[owner] = unclaimedGE[owner].add(saruScholarFee);
            myReward = myReward.sub(saruScholarFee);
        }

        // share items
        for (uint256 i = 0; i < itemIds.length; i++) {
            for (uint256 j = 0; j < itemIds[i].length; j++) {
                uint256 tokenId = itemIds[i][j];
                if (tokenId == 0x0) continue;
                (address owner, uint256 percent) = scholar.ownerInfo(kuniItem, tokenId);
                if (owner == msg.sender || owner == address(0x0)) continue;
                uint256 itemScholarFee = perReward.mul(percent).div(10000);
                unclaimedGE[owner] = unclaimedGE[owner].add(itemScholarFee);
                myReward = myReward.sub(itemScholarFee);
            }
        }
        return myReward;
    }

    function _saruDuplicate(uint256[] calldata tokenIds) internal pure returns (bool) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            for (uint256 j = i + 1; j < tokenIds.length; j++) {
                if (tokenIds[i] == tokenIds[j]) return false;
            }
        }
        return true;
    }

    function _invalidSaru(uint256[] calldata tokenIds, address sender) internal view returns (bool) {
        for (uint256 index = 0; index < tokenIds.length; index++) {
            uint256 tokenId = tokenIds[index];
            address sOwner;
            (sOwner, ) = scholar.ownerInfo(kuniSaru, tokenId);
            require(
                IERC721(kuniSaru).ownerOf(tokenId) == sender || _nftOwner[tokenId] == sender || sOwner != address(0x0),
                "KUNI: Your not is owner"
            );
        }
        return true;
    }

    function _invalidKuniItem(uint256[][] calldata itemIds, address sender) internal view returns (bool) {
        uint256 len = itemIds.length;
        if (len != 0) {
            uint256 slash;
            uint256 heavy;
            uint256 strike;
            uint256 tech;
            uint256 magic;
            for (uint256 i = 0; i < len; i++) {
                require(itemIds[i].length == 5, "KUNI: Unable to process request");
                slash = _equipmentCorrect(sender, itemIds[i][0], 1, slash);
                heavy = _equipmentCorrect(sender, itemIds[i][1], 2, heavy);
                strike = _equipmentCorrect(sender, itemIds[i][2], 3, strike);
                tech = _equipmentCorrect(sender, itemIds[i][3], 4, tech);
                magic = _equipmentCorrect(sender, itemIds[i][4], 5, magic);
            }
        }
        return true;
    }

    function _equipmentCorrect(
        address owner,
        uint256 tokenId,
        uint256 cat,
        uint256 item
    ) internal view returns (uint256) {
        if (tokenId > 0) {
            address sOwner;
            (sOwner, ) = scholar.ownerInfo(kuniItem, tokenId);
            require(IERC721(kuniItem).ownerOf(tokenId) == owner || sOwner != address(0x0), "KUNI: Your not is owner");
            uint256 _cat = tokenId % 5 == 0 ? 5 : tokenId % 5;
            require(_cat == cat, "KUNI: Unable to process request");
            if (item == 0) {
                item = tokenId;
            } else {
                require(item != tokenId, "KUNI: Unable to process request");
            }
        }
        return item;
    }

    // Saru staked Info
    function tokensBy(address account) external view returns (uint256[] memory nfts) {
        nfts = _nftSaru[account].values();
    }

    function tokenIdOf(address account, uint256 index) external view returns (uint256) {
        return _nftSaru[account].at(index);
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return _nftOwner[tokenId];
    }

    function balanceOf(address account) external view returns (uint256) {
        return _nftSaru[account].length();
    }

    function saruStakeOf(
        address sender,
        uint256 start,
        uint256 limit
    ) external view virtual returns (uint256[] memory, address[] memory) {
        uint256 total = _nftSaru[sender].length();
        uint256 size = limit;
        if (start + limit > total) size = total - start;
        uint256[] memory tokenIds = new uint256[](size);
        address[] memory owners = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            tokenIds[i] = _nftSaru[sender].at(start + i);
            owners[i] = _nftOwner[tokenIds[i]];
        }
        return (tokenIds, owners);
    }

    function stageOf(address player) external view override returns (uint256) {
        return stages[player] == 0 ? 1 : stages[player];
    }

    function battleBonusOf(address player) external view override returns (uint256) {
        return _battleBonus[player];
    }

    function _mUpdatePool(address mToken) internal {
        PoolInfo storage pool = pools[mToken];
        if (pool.supply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 rewardForMiner = IMaterial(mToken).getRewardForMiner(pool.lastRewardBlock, block.number);
        if (rewardForMiner > 0) {
            IMaterial(mToken).mint(address(this), rewardForMiner);
        }

        pool.rewardPerShare = pool.rewardPerShare.add(rewardForMiner.mul(MAGIC_NUM).div(pool.supply));
        pool.lastRewardBlock = block.number;
    }

    function _harvest(address mToken, UserInfo storage user) internal {
        PoolInfo storage pool = pools[mToken];
        if (pool.supply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        if (user.rewardDebtAtBlock < block.number) {
            uint256 reward = (user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM)).sub(user.rewardDebt);
            user.pendingReward = user.pendingReward.add(reward);
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
            user.rewardDebtAtBlock = block.number;
        }
    }

    function _mDeposit(address mToken, address sender, uint256 _amount, uint256 multiplier) internal {
        _amount = _amount.mul(multiplier).div(MAGIC_NUM);
        PoolInfo storage pool = pools[mToken];
        if (_amount > 0) {
            UserInfo storage user = userInfo[mToken][sender];
            _mUpdatePool(mToken);
            _harvest(mToken, user);
            user.amount = user.amount.add(_amount);
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
            pool.supply = pool.supply.add(_amount);
        }
    }

    function _mWithdraw(address mToken, address sender, uint256 _amount, uint256 multiplier) internal {
        _amount = _amount.mul(multiplier).div(MAGIC_NUM);
        UserInfo storage user = userInfo[mToken][sender];
        PoolInfo storage pool = pools[mToken];
        if (_amount > 0 && _amount <= user.amount) {
            _mUpdatePool(mToken);
            _harvest(mToken, user);
            uint256 mAmount = user.pendingReward;
            if (_amount < user.amount) {
                mAmount = _amount.mul(user.pendingReward).div(user.amount);
            }
            user.pendingReward = user.pendingReward.sub(mAmount);
            _transferToken(mToken, mAmount);
            user.amount = user.amount.sub(_amount);
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
            pool.supply = pool.supply.sub(_amount);
        }
    }

    function _mWithdraw(address mToken) internal {
        UserInfo storage user = userInfo[mToken][msg.sender];
        PoolInfo storage pool = pools[mToken];
        uint256 _amount = user.amount;
        if (_amount > 0) {
            _mUpdatePool(mToken);
            _harvest(mToken, user);
            user.amount = 0;
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
            pool.supply = pool.supply.sub(_amount);
            _transferToken(mToken, user.pendingReward);
            user.pendingReward = 0;
        }
    }

    function _mClaim(address mToken, address sender) internal {
        UserInfo storage user = userInfo[mToken][sender];
        if (user.amount > 0) {
            _mUpdatePool(mToken);
            _harvest(mToken, user);
            uint256 _amount = user.pendingReward;
            _transferToken(mToken, _amount);
            user.pendingReward = 0;
        }
    }

    function pendingReward(address mToken, address sender) external view returns (uint256) {
        PoolInfo storage pool = pools[mToken];
        UserInfo storage user = userInfo[mToken][sender];
        if (user.amount > 0) {
            uint256 rewardForMiner = IMaterial(mToken).getRewardForMiner(pool.lastRewardBlock, block.number);
            uint256 share = pool.rewardPerShare.add(rewardForMiner.mul(MAGIC_NUM).div(pool.supply));
            uint256 reward = (user.amount.mul(share).div(MAGIC_NUM)).sub(user.rewardDebt);
            return reward + user.pendingReward;
        }
        return 0;
    }

    function geStakedOf(address mToken, address sender) external view returns (uint256) {
        return userInfo[mToken][sender].amount;
    }

    function materialAt(uint index) external view returns (address) {
        return _materials[index];
    }

    function materials() external view returns (address[] memory) {
        return _materials;
    }

    // internal functions
    function _addToken(address _from, uint256 _tokenId) internal {
        if (!_nftSaru[_from].contains(_tokenId)) {
            _nftSaru[_from].add(_tokenId);
            _nftOwner[_tokenId] = _from;
        }
    }

    function _removeToken(address _from, uint256 _tokenId) internal {
        if (_nftSaru[_from].contains(_tokenId)) {
            _nftSaru[_from].remove(_tokenId);
            delete _nftOwner[_tokenId];
        }
    }

    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        IERC721(kuniSaru).safeTransferFrom(_from, _to, _tokenId);
        if (_to == address(this)) {
            // add
            _addToken(_from, _tokenId);
        } else {
            // remove: from is this
            _removeToken(_to, _tokenId);
        }
    }

    function _transferToken(address mToken, uint256 amount) internal {
        uint256 canTransf = IERC20(mToken).balanceOf(address(this));
        if (amount > canTransf) {
            amount = canTransf;
        }
        IERC20(mToken).transfer(msg.sender, amount);
    }

    function setMining(address mining_) external onlyOwner {
        miningKuni = mining_;
    }

    function setGE(address ge_) external onlyOwner {
        ge = ge_;
    }

    function setFoundation(address addr) external onlyOwner {
        foundation = addr;
    }

    function setItem(address addr) external onlyOwner {
        kuniItem = addr;
    }

    function setEco(address addr) external onlyOwner {
        eco = IEcoGame(addr);
    }

    function setReferral(address addr) external onlyOwner {
        referral = addr;
    }

    function setScholar(address addr) external onlyOwner {
        scholar = IScholarship(addr);
    }

    // ore, stone, cotton, lumber
    function setMaterials(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            _materials[i] = tokens[i];
        }
    }

    function setGenesisTime(uint256 _start) external onlyOwner {
        genesisTime = _start;
    }

    modifier onlyStart() {
        require(genesisTime < block.timestamp, "KUNI: Not open!");
        _;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
