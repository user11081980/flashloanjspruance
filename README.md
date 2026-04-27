# Index
* `FlashLoanArbitrage.sol` executes flash loans with 1Inch.
* `FlashLoanArbitrage2.sol` executes flash loans with Velora.
* `executeFlashLoanArbitrage.js` finds opportunities in BNB with 1Inch.
* `executeFlashLoanArbitrage2.js` finds opportunities in BNB with Velora.
* `executeFlashLoanArbitrage3.js` finds opportunities in Arbitrum with Velora.

# Commands
* `npm ci`
* `npx hardhat node`
* `npx hardhat compile`
* `npx hardhat test --network hardhat`
* `npx hardhat run scripts/deployFlashLoanArbitrage.js --network mainnet`
* `npx hardhat run scripts/executeFlashLoanArbitrage.js --network mainnet`
* `set HARDHAT_NETWORK=mainnet&& npx pm2 start scripts/executeFlashLoanArbitrage.js --name arbitrage`
* `npx pm2 monit arbitrage`
* `npx pm2 delete arbitrage`

# Notes
* The `PancakeSwapFlashSwap` and `OneInchFlashSwap` contracts had functions to initiate the flash loan. Likewise, `FlashLoanArbitrage` initiates the flash loan from `requestFlashLoan()` by calling `IPool.flashLoanSimple()`, where the parameters `asset` and `amount` indicate the token and amount to borrow. Any other additional information needed for 1Inch should be encoded in `params`.
* The word "pool" is ambiguous. In the world of Automated Market Makers like Uniswap, a pool is a pair. However, in Aave, the pool refers to a lending pool, which functions more like a massive, multi-asset warehouse. The address returned by `IPoolAddressesProvider.getPool()` is the main entry point of interacting with Aave, where `IPoolAddressesProvider` acts as a proxy where the entire purpose is to enable Aave update the underlying contract when needed.

# Debug
0x3F746fb4396a8DA588884d0Da92Ed501C1fe9c6d contract without callback implementation
0x43D55F784980C99dC230dcDEC0fE1793897cBFce contract without callback implementation and without call to flashloan // THIS ONE SUCCEEDS. THE PROBLEM IS WHEN CALLING POOL.FLASHLOANSIMPLE
0x64a50f9C300F912674B56272cb17BD436E7180ff contract with revert inside the callback, at the very top after variable initialization
0xa4156719db18B95cE6A31D375bF8076A5951c306 contract with revert inside the callback, at the very top before variable initialization
0x956E5944E6ca3D8491140DFF77aA5a17Ef2e11dC contract with this callback implementation
// JUST APPROVE AND FINISH
uint256 amountOwed = amount + premium;
IERC20(asset).approve(address(POOL), amountOwed);
return true;
0x74A46C8d39D2F91084b2738F0dD5aE8f728408E7 contract with this requestFlashLoan implementation // THIS ONE SUCCEEDS.
POOL.getReserveData(_token);