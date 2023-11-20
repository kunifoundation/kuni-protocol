// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IERC20Burnable.sol";
import "../interfaces/IMiningKuni.sol";

contract MiningKuni is ERC20("Kuni", "KUNI"), IMiningKuni, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingReward;
        uint256 rewardDebtAtBlock;
    }

    struct PoolInfo {
        uint256 gasUsed;
        uint256 rewardPerShare;
        uint256 lastRewardBlock;
        EnumerableSet.AddressSet minters;
    }

    uint256 MAX_SUPPLY = 21000000 ether;
    uint256 NUM_OF_BLOCK_PER_DAY = 28800;
    uint256 MAGIC_NUM = 1e12;
    uint256 RATE = 1000;
    uint256 BLOCK_LIMIT = 200; // 200 block ~ 10 minute

    mapping(address => PoolInfo) private poolInfo;
    mapping(address => mapping(address => UserInfo)) public userInfo;
    uint256 public totalGasUsed = 0;
    uint start = 0;
    uint256 public mintAtBlock = 0;
    address[] public getPools;
    mapping(address => uint256) public gasTemp;
    mapping(address => address) public picGE;
    mapping(address => bool) public geSupported;
    uint256 public kuniBlock;
    uint256 public distanceBock = 0;
    address public coreGame;

    event MineKuni(address indexed user, address indexed ge, uint256 amount);
    event ClaimKuni(address indexed user, address indexed ge, uint256 amount);
    
    constructor() {
        mintAtBlock = block.number;
        kuniBlock = block.number;
    }

    function getRewardForMiner(uint256 _from, uint256 _to, uint256 _gasUsed) public view returns (uint256) {
        if (totalGasUsed > 0)
            return _to.sub(_from).mul(MAX_SUPPLY.sub(totalSupply()).mul(RATE).div(1000000).mul(_gasUsed).div(totalGasUsed)).div(NUM_OF_BLOCK_PER_DAY);
        return 0;
    }

    function updateBlockNumber() private {
        (kuniBlock, distanceBock) = getBlockCurrent(kuniBlock, distanceBock);
    }

    function getBlockCurrent(uint256 _block, uint256 _dist) private view returns(uint256, uint256) {
        if (_block + _dist >= block.number) return (_block, _dist);
        if (block.number - _block - _dist < BLOCK_LIMIT) {
            _block = block.number - _dist;
        } else {
            _block = _block + BLOCK_LIMIT;
            _dist = block.number - _block;
        }
        return (_block, _dist);
    }

    function updatePool(address _ge) private {
        updateBlockNumber();
        PoolInfo storage pool = poolInfo[_ge];
        uint256 geSupply = IERC20(_ge).balanceOf(address(this));
        if (geSupply == 0) {
            pool.lastRewardBlock = kuniBlock;
            return;
        }

        uint256 rewardForMiner = getRewardForMiner(pool.lastRewardBlock, kuniBlock, pool.gasUsed);
        if (rewardForMiner > 0) {
            _mint(address(this), rewardForMiner);
            mintAtBlock = kuniBlock;
        }
        pool.rewardPerShare = pool.rewardPerShare.add(rewardForMiner.mul(MAGIC_NUM).div(geSupply));
        pool.lastRewardBlock = kuniBlock;
    }

    function _harvest(address _ge, address sender) internal {
        PoolInfo storage pool = poolInfo[_ge];
        UserInfo storage user = userInfo[_ge][sender];
        if (user.rewardDebtAtBlock < kuniBlock) {
            uint256 reward = (user.amount.mul(pool.rewardPerShare)).div(MAGIC_NUM).sub(user.rewardDebt);
            user.pendingReward = user.pendingReward.add(reward);
            user.rewardDebtAtBlock = kuniBlock;
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
        }
    }

    function mineKuni(address _ge, uint256 _amount) external override _geSupport(_ge) nonReentrant {
        require(_amount > 0, "Amatsu: ZERO_AMOUNT");
        _mineKuni(_ge, msg.sender, _amount, true);
    }

    function mineKuniFrom(address sender, address _ge, uint256 _amount) external override _onlyCoreGame _geSupport(_ge) nonReentrant {
        if (_amount > 0) {
            _mineKuni(_ge, sender, _amount, false);
        }
    }

    function _mineKuni(address _ge, address sender, uint256 _amount, bool isTransfer) internal {
        if (_amount > 0) {
            PoolInfo storage pool = poolInfo[_ge];
            UserInfo storage user = userInfo[_ge][sender];
            updatePool(_ge);
            _harvest(_ge, sender);
            if (isTransfer) {
                IERC20(_ge).safeTransferFrom(address(sender), address(this), _amount);
            }
            user.amount = user.amount.add(_amount);
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
            emit MineKuni(sender, _ge, _amount);
        }
    }

    function claimKuni(address _ge, uint256 _amount) external override _geSupport(_ge) nonReentrant {
        PoolInfo storage pool = poolInfo[_ge];
        UserInfo storage user = userInfo[_ge][msg.sender];
        require(user.amount >= _amount, "Amatsu: INVALID_AMOUNT");
        updatePool(_ge);
        _harvest(_ge, msg.sender);
        IERC20Burnable(_ge).burn(_amount);
        uint256 reward = user.pendingReward;
        if (_amount < user.amount) {
            reward = _amount.mul(user.pendingReward).div(user.amount);
        }

        user.pendingReward = user.pendingReward.sub(reward);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
        if (reward > 0) {
            _transfer(address(this), msg.sender, reward);
        }
        
        emit ClaimKuni(msg.sender, _ge, _amount);
    }

    function geStakedOf(address _ge, address acc) external view override returns(uint256) {
        return userInfo[_ge][acc].amount;
    }

    function gasUsedDeclaration(uint256 gasStart, uint256 gasEnd) override external nonReentrant {
        if (gasStart <= gasEnd) return;
        updateBlockNumber();
        uint256 _gasUsed = gasStart - gasEnd;
        address geAddr = picGE[msg.sender];
        if (geAddr == address(0x0)) {
            gasTemp[msg.sender] += _gasUsed;
        } else {
           PoolInfo storage pool = poolInfo[geAddr];
           totalGasUsed += _gasUsed;
           pool.gasUsed += _gasUsed;
        }
    }

    function getPoolsLength() public view returns (uint256) {
        return getPools.length;
    }

    function getPoolInfo(address _ge) public view returns (uint256, uint256, uint256) {
        PoolInfo storage pool = poolInfo[_ge];
        return (pool.gasUsed, pool.rewardPerShare, pool.lastRewardBlock);
    }

    function peddingReward(address ge, address sender) external view returns(uint256) {
        UserInfo storage user = userInfo[ge][sender];
        if (user.amount > 0) {
            (uint256 blockNumber, )= getBlockCurrent(kuniBlock, distanceBock);
            PoolInfo storage pool = poolInfo[ge];
            uint256 shareReward = getReward2Share(ge, blockNumber, pool);
            uint256 reward = (user.amount.mul(shareReward).div(MAGIC_NUM)).sub(user.rewardDebt);
            return reward + user.pendingReward;
        }
        return 0;
    }

    function getReward2Share(address _ge, uint256 toblock, PoolInfo storage pool) internal view returns(uint256) {
        uint256 geSupply = IERC20(_ge).balanceOf(address(this));
        uint256 rewardForMiner = getRewardForMiner(pool.lastRewardBlock, toblock, pool.gasUsed);
        return pool.rewardPerShare.add(rewardForMiner.mul(MAGIC_NUM).div(geSupply));
    }

    function addPool(address _ge, address[] calldata minters) external onlyOwner {
        if (!geSupported[_ge]) {
            geSupported[_ge] = true;
        }
        PoolInfo storage pool = poolInfo[_ge];
        for (uint i = 0; i < getPools.length; i++) {
            updatePool(getPools[i]);
        }

        if (pool.lastRewardBlock == 0) {
            getPools.push(_ge);
        }

        for (uint256 inx = 0; inx < minters.length; inx++) {
            if (!pool.minters.contains(minters[inx]) && picGE[minters[inx]] == address(0x0)) {
                poolInfo[_ge].minters.add(minters[inx]);
                pool.gasUsed += gasTemp[minters[inx]];
                totalGasUsed += gasTemp[minters[inx]];
                gasTemp[minters[inx]] = 0;
                picGE[minters[inx]] = _ge;
            }
        }
        pool.lastRewardBlock = kuniBlock;
    }

    function addCoreGame(address core) external onlyOwner {
        coreGame = core;
    }

    modifier _geSupport(address ge) {
        require(geSupported[ge], 'KUNI: TOKEN unsupported!');
        _;
    }

    modifier _onlyCoreGame() {
        require(msg.sender == coreGame, 'KUNI: caller is not the CoreGame AmaKuni!');
        _;
    }
}
