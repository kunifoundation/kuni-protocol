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

    uint256 MAGIC_NUM = 1 ether;
    uint256 PERCENT = 10000;
    
    uint256 private MAX_SARU = 6;
    // owner => tokenIds
    mapping(address => EnumerableSet.UintSet) private _nftSaru;
    // tokenId => owner
    mapping(uint256 => address) private _nftOwner;
    mapping(address => uint256) public kuniStakedOf;

    address[] public _materials = new address[](4);
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
    uint256 public getGenesisTime;

    constructor(
        uint256 genesisTime_,
        address miningAddr_,
        address kuniSaru_,
        address kuniItem_,
        address eco_,
        address scholar_,
        address referral_,
        address ge_,
        address foundation_
    ) {
        kuniSaru = kuniSaru_;
        kuniItem = kuniItem_;
        eco = IEcoGame(eco_);
        scholar = IScholarship(scholar_);
        referral = referral_;
        getGenesisTime = genesisTime_;
        miningKuni = miningAddr_;
        ge = ge_;
        foundation = foundation_;
    }

    function deposit(uint256 kuniAmount, uint256[] calldata tokenIds) external override nonReentrant {
        uint256[] memory effTeam = new uint256[](4);

        if (tokenIds.length > 0) {
            for (uint256 index = 0; index < tokenIds.length; index++) {
                _transfer(msg.sender, address(this), tokenIds[index]);
            }
        }

        if (kuniAmount > 0) {
            IERC20(miningKuni).transferFrom(msg.sender, address(this), kuniAmount);
            kuniStakedOf[msg.sender] = kuniStakedOf[msg.sender].add(kuniAmount);
        }
        // call
        effTeam = eco.calProductivityTeam(msg.sender, _nftSaru[msg.sender].values(), kuniStakedOf[msg.sender]);
        for (uint256 inx = 0; inx < _materials.length; inx++) {
            _mUpdateAmount(_materials[inx], effTeam[inx]);
        }
    }

    function _mUpdateAmount(address mToken, uint256 amount) internal {
        PoolInfo storage pool = pools[mToken];
        UserInfo storage user = userInfo[mToken][msg.sender];
        if (amount > 0) {
            _mUpdatePool(mToken);
            _harvest(mToken, user);
            pool.supply = pool.supply.sub(user.amount).add(amount);
            user.amount = amount;
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
        }
    }

    function claim() external override nonReentrant {
        for (uint256 inx = 0; inx < _materials.length; inx++) {
            _mClaim(_materials[inx]);
        }
    }

    function withdrawTokens(uint256 kuniAmount, uint256[] calldata tokenIds) external override nonReentrant {
        if (tokenIds.length > 0) {
            // saru withdraw
            for (uint256 inx = 0; inx < tokenIds.length; inx++) {
                require(msg.sender == _nftOwner[tokenIds[inx]], "KUNI: You are not the owner");
                _transfer(address(this), msg.sender, tokenIds[inx]);
            }
        }

        if (kuniAmount > 0) {
            // transfer $kuni
            _transferToken(miningKuni, kuniAmount);
            kuniStakedOf[msg.sender] = kuniStakedOf[msg.sender].sub(kuniAmount);
        }

        uint256[] memory mValues = eco.calProductivityTeam(msg.sender, _nftSaru[msg.sender].values(), kuniStakedOf[msg.sender]);
        for (uint256 inx = 0; inx < _materials.length; inx++) {
            _mUpdateAmount(_materials[inx], mValues[inx]);
        }
    }

    function withdraw() external override nonReentrant {
        // widthraw saru staked
        for (uint256 inx = _nftSaru[msg.sender].length(); inx > 0; inx--) {
            _transfer(address(this), msg.sender, _nftSaru[msg.sender].at(inx - 1));
        }

        if (kuniStakedOf[msg.sender] > 0) {
            _transferToken(miningKuni, kuniStakedOf[msg.sender]);
            kuniStakedOf[msg.sender] = 0;
        }

        for (uint256 inx = 0; inx < _materials.length; inx++) {
            _mUpdateAmount(_materials[inx], 0);
        }
    }

    function fighting(
        uint256[] calldata tokenIds,
        uint256[][] calldata itemIds
    ) external override nonReentrant onlyStart {
        IMiningKuni(miningKuni).gasStart();
        require(itemIds.length <= tokenIds.length && tokenIds.length <= MAX_SARU, "KUNI: Unable to process request");
        _invalidSaru(tokenIds);
        _invalidKuniItem(itemIds);
        _fighting(tokenIds, itemIds);
        IMiningKuni(miningKuni).gasEnd();
    }

    function claimGE() external override nonReentrant {
        uint256 amount = unclaimedGE[msg.sender];
        if (amount > 0) {
            IMaterial(ge).mint(msg.sender, amount);
            unclaimedGE[msg.sender] = 0;
        }
        emit ClaimGE(msg.sender, amount);
        _earnKuni(foundation);
    }

    function earnKuni() external nonReentrant {
        _earnKuni(msg.sender);
        _earnKuni(foundation);
    }

    function _earnKuni(address sender) internal {
        uint256 amount = unclaimedGE[sender];
        if (amount > 0) {
            IMiningKuni(miningKuni).mineKuniFrom(sender, ge, amount);
            IMaterial(ge).mint(miningKuni, amount);
            emit EarnKuni(sender, amount);
            unclaimedGE[sender] = 0;
        }
    }

    function _fighting(uint256[] calldata tokenIds, uint256[][] calldata itemIds) internal {
        if (stages[msg.sender] == 0) {
            stages[msg.sender] = 1;
        }
        (bool won, uint256 totalItem, uint256 niohPower) = eco.advantagePoint(
            tokenIds,
            kuniItem,
            itemIds,
            stages[msg.sender],
            _battleBonus[msg.sender]
        );
        uint256 reward = eco.rewardPoint(stages[msg.sender], won, tokenIds.length, totalItem);

        if (won) {
            stages[msg.sender] = stages[msg.sender].add(1);
        }

        uint256 myReward = _shareReward(reward, tokenIds, itemIds, totalItem);
        unclaimedGE[msg.sender] = unclaimedGE[msg.sender].add(myReward);
        emit Fighting(msg.sender, tokenIds, itemIds, myReward, niohPower, won);
        _battleBonus[msg.sender] = eco.battleBonusInc(_battleBonus[msg.sender]);
    }

    function _shareReward(
        uint256 reward,
        uint256[] calldata tokenIds,
        uint256[][] calldata itemIds,
        uint256 totalItem
    ) internal returns (uint256) {
        address refOwner;
        uint256 refReward;
        (reward, refReward, refOwner) = IReferral(referral).refPoint(msg.sender, reward);
        if (refOwner != address(0x0) && refReward > 0) {
            unclaimedGE[refOwner] = unclaimedGE[refOwner].add(refReward);
        }

        uint256 myReward = reward;
        uint256 perReward = reward.div(totalItem.add(tokenIds.length));
        // share saru
        for (uint256 inx = 0; inx < tokenIds.length; inx++) {
            (address owner, uint256 percent) = scholar.ownerInfo(kuniSaru, tokenIds[inx]);
            if (owner == msg.sender || owner == address(0x0)) continue;
            uint256 saruScholarFee = perReward.mul(percent).div(PERCENT);
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
                uint256 itemScholarFee = perReward.mul(percent).div(PERCENT);
                unclaimedGE[owner] = unclaimedGE[owner].add(itemScholarFee);
                myReward = myReward.sub(itemScholarFee);
            }
        }
        return myReward;
    }

    function _invalidSaru(uint256[] calldata tokenIds) internal view {
        for (uint256 index = 0; index < tokenIds.length; index++) {
            for (uint256 j = index + 1; j < tokenIds.length; j++) {
                require(tokenIds[index] != tokenIds[j], "KUNI: Saru Duplicated!");
            }
            uint256 tokenId = tokenIds[index];
            address sOwner;
            (sOwner, ) = scholar.ownerInfo(kuniSaru, tokenId);
            require(
                IERC721(kuniSaru).ownerOf(tokenId) == msg.sender || _nftOwner[tokenId] == msg.sender || sOwner != address(0x0),
                "KUNI: You are not the owner"
            );
        }
    }

    function _invalidKuniItem(uint256[][] calldata itemIds) internal view {
        uint256 len = itemIds.length;
        for (uint256 i = 0; i < len; i++) {
            require(itemIds[i].length == 5, "KUNI: Unable to process request");
            _equipmentCorrect(msg.sender, itemIds[i][0], 1);
            _equipmentCorrect(msg.sender, itemIds[i][1], 2);
            _equipmentCorrect(msg.sender, itemIds[i][2], 3);
            _equipmentCorrect(msg.sender, itemIds[i][3], 4);
            _equipmentCorrect(msg.sender, itemIds[i][4], 5);
            // kiem tra trung item

            for (uint256 j = i + 1; j < len; j++) {
                require(itemIds[i][0] != itemIds[j][0] || itemIds[j][0] == 0, "KUNI: Item Duplicated!");
                require(itemIds[i][1] != itemIds[j][1] || itemIds[j][1] == 0, "KUNI: Item Duplicated!");
                require(itemIds[i][2] != itemIds[j][2] || itemIds[j][2] == 0, "KUNI: Item Duplicated!");
                require(itemIds[i][3] != itemIds[j][3] || itemIds[j][3] == 0, "KUNI: Item Duplicated!");
                require(itemIds[i][4] != itemIds[j][4] || itemIds[j][4] == 0, "KUNI: Item Duplicated!");
            }
        }
    }

    function _equipmentCorrect(address owner, uint256 tokenId, uint256 cat) internal view {
        if (tokenId > 0) {
            address sOwner;
            (sOwner, ) = scholar.ownerInfo(kuniItem, tokenId);
            require(IERC721(kuniItem).ownerOf(tokenId) == owner || sOwner != address(0x0), "KUNI: You are not the owner");
            uint256 _cat = tokenId % 5 == 0 ? 5 : tokenId % 5;
            require(_cat == cat, "KUNI: Unable to process request");
        }
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

        uint256 reward = (user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM)).sub(user.rewardDebt);
        user.pendingReward = user.pendingReward.add(reward);
        user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
    }

    function _mClaim(address mToken) internal {
        UserInfo storage user = userInfo[mToken][msg.sender];
        _mUpdatePool(mToken);
        _harvest(mToken, user);
        uint256 _amount = user.pendingReward;
        _transferToken(mToken, _amount);
        user.pendingReward = 0;
    }

    function pendingReward(address mToken, address sender) external view returns (uint256) {
        PoolInfo storage pool = pools[mToken];
        UserInfo storage user = userInfo[mToken][sender];
        uint256 rewardForMiner = IMaterial(mToken).getRewardForMiner(pool.lastRewardBlock, block.number);
        uint256 share = pool.rewardPerShare.add(rewardForMiner.mul(MAGIC_NUM).div(pool.supply));
        uint256 reward = (user.amount.mul(share).div(MAGIC_NUM)).sub(user.rewardDebt);
        return reward + user.pendingReward;
    }

    function geStakedOf(address mToken, address sender) external view returns (uint256) {
        return userInfo[mToken][sender].amount;
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

    function setEco(address addr) external onlyOwner {
        eco = IEcoGame(addr);
    }

    // // ore, stone, cotton, lumber
    function setMaterials(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            _materials[i] = tokens[i];
        }
    }

    function setGenesisTime(uint256 _start) external onlyOwner {
        getGenesisTime = _start;
    }

    modifier onlyStart() {
        require(getGenesisTime <= block.timestamp, "KUNI: Not open!");
        _;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
