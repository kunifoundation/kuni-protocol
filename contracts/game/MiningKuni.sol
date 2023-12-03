// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
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
        EnumerableSet.AddressSet minters;
    }

    uint256 MAX_SUPPLY = 21000000 ether;
    uint256 NUM_OF_BLOCK_PER_DAY = 28800;
    uint256 MAGIC_NUM = 1e12;
    uint256 RATE = 5;
    uint256 BASE_RATE = 10000;
    uint256 BLOCK_LIMIT = 200; // 200 block ~ 10 minute

    mapping(address => PoolInfo) private poolInfo;
    mapping(address => mapping(address => UserInfo)) public userInfo;
    uint256 public totalGasUsed = 0;
    uint256 public lastRewardBlock = 0;
    address[] public getPools;
    mapping(address => uint256) public gasTemp;
    mapping(address => address) public picGE;
    mapping(address => bool) public geSupported;
    address public coreGame;

    uint256 private gasBlock;
    uint256 private initialGas;

    uint256 public kuniBlock;

    event MineKuni(address indexed user, address indexed ge, uint256 amount);
    event ClaimKuni(address indexed user, address indexed ge, uint256 amount);

    constructor() {
        lastRewardBlock = block.number;
    }

    function getPoolReward(uint256 _from, uint256 _to, uint256 _gasUsed) public view returns (uint256) {
        if (totalGasUsed > 0)
            return
                _to
                    .sub(_from)
                    .mul(MAX_SUPPLY.sub(totalSupply()).mul(RATE).div(BASE_RATE).mul(_gasUsed).div(totalGasUsed))
                    .div(NUM_OF_BLOCK_PER_DAY);
        return 0;
    }

    function _updatePool(address _ge) private {
        if (block.number > lastRewardBlock) {
            uint256 duration = block.number - lastRewardBlock;
            if (duration > BLOCK_LIMIT) {
                duration = BLOCK_LIMIT;
            }

            uint256 amount = duration.mul(MAX_SUPPLY.sub(totalSupply()).mul(RATE).div(BASE_RATE)).div(
                NUM_OF_BLOCK_PER_DAY
            );
            if (amount > 0) {
                _mint(address(this), amount);
            }

            PoolInfo storage pool = poolInfo[_ge];
            uint256 geSupply = IERC20(_ge).balanceOf(address(this));
            if (geSupply == 0) {
                return;
            }
            // loops pools
            uint256 rewardForMiner = getPoolReward(lastRewardBlock, lastRewardBlock + duration, pool.gasUsed);
            pool.rewardPerShare = pool.rewardPerShare.add(rewardForMiner.mul(MAGIC_NUM).div(geSupply));
            lastRewardBlock = block.number;
        }
    }

    function _harvest(address _ge, address sender) internal {
        PoolInfo storage pool = poolInfo[_ge];
        UserInfo storage user = userInfo[_ge][sender];
        if (user.rewardDebtAtBlock < block.number) {
            uint256 reward = (user.amount.mul(pool.rewardPerShare)).div(MAGIC_NUM).sub(user.rewardDebt);
            user.pendingReward = user.pendingReward.add(reward);
            user.rewardDebtAtBlock = block.number;
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
        }
    }

    function mineKuni(address _ge, uint256 _amount) external override _geSupport(_ge) nonReentrant {
        require(_amount > 0, "KUNI: ZERO_AMOUNT");
        _mineKuni(_ge, msg.sender, _amount);
        IERC20(_ge).safeTransferFrom(address(msg.sender), address(this), _amount);
    }

    function mineKuniFrom(
        address sender,
        address _ge,
        uint256 _amount
    ) external override _onlyCoreGame _geSupport(_ge) nonReentrant {
        _mineKuni(_ge, sender, _amount);
    }

    function _mineKuni(address _ge, address sender, uint256 _amount) internal {
        if (_amount > 0) {
            PoolInfo storage pool = poolInfo[_ge];
            UserInfo storage user = userInfo[_ge][sender];
            _updatePool(_ge);
            _harvest(_ge, sender);
            user.amount = user.amount.add(_amount);
            user.rewardDebt = user.amount.mul(pool.rewardPerShare).div(MAGIC_NUM);
            emit MineKuni(sender, _ge, _amount);
        }
    }

    function claimKuni(address _ge, uint256 _amount) external override _geSupport(_ge) nonReentrant {
        PoolInfo storage pool = poolInfo[_ge];
        UserInfo storage user = userInfo[_ge][msg.sender];
        require(user.amount >= _amount, "KUNI: INVALID_AMOUNT");
        _updatePool(_ge);
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

    function geStakedOf(address _ge, address acc) external view override returns (uint256) {
        return userInfo[_ge][acc].amount;
    }

    function _gasStart() internal nonReentrant {
        initialGas = gasleft();
        gasBlock = block.number;
    }

    function _gasEnd() internal nonReentrant {
        uint256 finalGas = gasleft();
        if (gasBlock == block.number && initialGas > finalGas) {
            uint256 _gasUsed = initialGas - finalGas;
            address geAddr = picGE[msg.sender];
            if (geAddr == address(0x0)) {
                gasTemp[msg.sender] += _gasUsed;
            } else {
                PoolInfo storage pool = poolInfo[geAddr];
                totalGasUsed += _gasUsed;
                pool.gasUsed += _gasUsed;
            }
        }

        gasBlock = 0;
        initialGas = 0;
    }

    function getPoolsLength() public view returns (uint256) {
        return getPools.length;
    }

    function getPoolInfo(address _ge) public view returns (uint256, uint256, uint256) {
        PoolInfo storage pool = poolInfo[_ge];
        return (pool.gasUsed, pool.rewardPerShare, lastRewardBlock);
    }

    function pendingReward(address ge, address sender) external view returns (uint256) {
        UserInfo storage user = userInfo[ge][sender];
        if (user.amount > 0) {
            PoolInfo storage pool = poolInfo[ge];
            uint256 pendingAmount = user.pendingReward;
            if (lastRewardBlock < block.number) {
                uint256 duration = block.number - lastRewardBlock;
                if (duration > BLOCK_LIMIT) {
                    duration = BLOCK_LIMIT;
                }

                uint256 geSupply = IERC20(ge).balanceOf(address(this));
                uint256 estimateRewardPool = getPoolReward(lastRewardBlock, lastRewardBlock + duration, pool.gasUsed);
                uint256 shareRewardPending = pool.rewardPerShare.add(estimateRewardPool.mul(MAGIC_NUM).div(geSupply));
                pendingAmount =
                    pendingAmount +
                    (user.amount.mul(shareRewardPending).div(MAGIC_NUM)).sub(user.rewardDebt);
            }
            return pendingAmount;
        }
        return 0;
    }

    function addPool(address _ge, address[] calldata minters) external onlyOwner {
        if (!geSupported[_ge]) {
            geSupported[_ge] = true;
        }
        PoolInfo storage pool = poolInfo[_ge];
        for (uint i = 0; i < getPools.length; i++) {
            _updatePool(getPools[i]);
        }

        if (lastRewardBlock == 0) {
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
        lastRewardBlock = block.number;
    }

    function addCoreGame(address core) external onlyOwner {
        coreGame = core;
    }

    modifier _geSupport(address ge) {
        require(geSupported[ge], "KUNI: TOKEN unsupported!");
        _;
    }

    modifier _onlyCoreGame() {
        require(msg.sender == coreGame, "KUNI: caller is not the CoreGame AmaKuni!");
        _;
    }

    // TODO: Mainnet remove
    function testGas() external {
        _gasStart();
        for (uint256 index = 0; index < 100; index++) {}
        _gasEnd();
    }

    function gasStart() external override {
        _gasStart();
    }

    function gasEnd() external override {
        _gasEnd();
    }
}
