# Commands
* `npm ci`
* `npx hardhat node`
* `npx hardhat test --network hardhat`

# Notes
* The `PancakeSwapFlashSwap` and `OneInchFlashSwap` contracts had functions to initiate the flash loan. Likewise, `FlashLoanArbitrage` initiates the flash loan from `requestFlashLoan()` by calling `IPool.flashLoanSimple()`, where the parameters `asset` and `amount` indicate the token and amount to borrow. Any other additional information needed for 1Inch should be encoded in `params`.
* The word "pool" is ambiguous. In the world of Automated Market Makers like Uniswap, a pool is a pair. However, in Aave, the pool refers to a lending pool, which functions more like a massive, multi-asset warehouse. The address returned by `IPoolAddressesProvider.getPool()` is the main entry point of interacting with Aave, where `IPoolAddressesProvider` acts as a proxy where the entire purpose is to enable Aave update the underlying contract when needed.

# TODO
* Add logging to contract