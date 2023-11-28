// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

interface IAmaGame {
  /* ========== EVENTS ========== */
  event Deposit(address indexed user, uint256[] tokenIds, uint256 indexed kuni);
  event Claim(address indexed user);
  event WithdrawTokens(address indexed user, uint256 amount, uint256[] tokenIds);
  event Withdraw(address indexed user, uint256 kuni); 
  event Fighting(address indexed user, uint256[] tokenIds, uint256[][] itemIds, uint256 ge, uint256 power, bool won);
  event ClaimGE(address indexed user, uint256 amount);
  event EarnKuni(address indexed user, uint256 amount);
  /* ========== FUNCTIONS ========== */

  function deposit(uint256 kuni, uint256[] calldata tokenIds) external;
  function claim() external;
  function withdrawTokens(uint256 kuni, uint256[] calldata tokenIds) external;
  function withdraw() external;
  function fighting(uint256[] memory tokenIds, uint256[][] memory itemIds) external;
  function claimGE() external;

  function stageOf(address player) external view returns(uint256);
  function battleBonusOf(address player) external view returns(uint256);

  struct UserInfo {
    uint256 amount;
    uint256 pendingReward;
    uint256 rewardDebt;
    uint256 rewardDebtAtBlock;
  }

  struct PoolInfo {
    address token;
    uint256 supply; // How many allocation supply assigned to this pool. KUNIs to distribute per block.
    uint256 lastRewardBlock;  // Last block number that Materials distribution occurs.  
    uint256 rewardPerShare; // Accumulated Rewards per share, times 1e12. See below.
  }

}