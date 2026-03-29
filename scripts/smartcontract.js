/*
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}
contract VeloraArbExecutor {
    address public immutable AUGUSTUS_ROUTER; // The 'to' address from buildTx
    address public immutable WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
constructor(address _augustus) {
        AUGUSTUS_ROUTER = _augustus;
    }
/// @notice Executes a two-step triangular arbitrage
    /// @param tokenA The intermediate token address
    /// @param data1 Calldata for WBNB -> TokenA
    /// @param data2 Calldata for TokenA -> WBNB
    function executeArb(
        address tokenA,
        bytes calldata data1,
        bytes calldata data2
    ) external {
        uint256 startBalance = IERC20(WBNB).balanceOf(address(this));
// 1. Approve & Swap Leg 1: WBNB -> TokenA
        IERC20(WBNB).approve(AUGUSTUS_ROUTER, type(uint256).max);
        (bool success1, ) = AUGUSTUS_ROUTER.call(data1);
        require(success1, "First leg failed");
// 2. Approve & Swap Leg 2: TokenA -> WBNB
        uint256 tokenABalance = IERC20(tokenA).balanceOf(address(this));
        IERC20(tokenA).approve(AUGUSTUS_ROUTER, type(uint256).max);
        (bool success2, ) = AUGUSTUS_ROUTER.call(data2);
        require(success2, "Second leg failed");
// 3. Profit Check
        uint256 endBalance = IERC20(WBNB).balanceOf(address(this));
        require(endBalance > startBalance, "No profit: Reverting");
        
        // Optional: Send profit to owner
        // IERC20(WBNB).transfer(msg.sender, endBalance - startBalance);
    }
// Function to withdraw tokens if they get stuck
    function withdraw(address token) external {
        uint256 amount = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, amount);
    }
}

*/