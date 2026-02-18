const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;
const IERC20 = require("@openzeppelin/contracts/build/contracts/IERC20.json");
const abi = IERC20.abi;
const constants = require("../constants/constants");
const utilities = require("../utils/utilities");

describe("Aave Flash Loan contract on Hardhat BNB Chain mainnet local forked network", () => {
    let provider = null;
    let flashLoanContract = null;

    before(async () => {
        // Waffle is a smart contract testing library that uses JavaScript, is a part of Hardhat, and acts as a connection to the Ethereum network, where the statement waffle.provider creates a local in-memory Ethereum node
        provider = waffle.provider;

        // Deploy the smart contract to the Hardhat's local in-memory Ethereum network as provided in the network configuration. The contract must be defined in the default "contracts" directory. The returned factory has methods like deploy(), which is used to deploy the contract.
        const flashLoanContractFactory = await ethers.getContractFactory("FlashLoan");
        flashLoanContract = await flashLoanContractFactory.deploy(constants.ADDRESSES.POOL_ADDRESSES_PROVIDER);
        await flashLoanContract.deployed();
        console.log(flashLoanContract.address);
        console.log("POOL Address:", await flashLoanContract.getPoolAddress());
        console.log("PoolAddressesProvider:", await flashLoanContract.getPoolAddressesProviderAddress());
    });

    it("should fail to request flash loan", async () => {
        // Fund the contract so that it can repay the loan. This function impersonates the whale, sends funds to the contract, and stops impersonating the whale.
        const wbnbContract = new ethers.Contract(constants.ADDRESSES.WBNB, abi, provider);
        await utilities.impersonateFundErc20(
            wbnbContract,
            constants.ADDRESSES.WHALE_WBNB,
            flashLoanContract.address,
            constants.AMOUNTS.AMOUNT_TO_FUND
        );
        expect(await flashLoanContract.getBalance(constants.ADDRESSES.WBNB)).to.be.above(0);

        await flashLoanContract.requestFlashLoan(
            constants.ADDRESSES.WBNB,
            ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS));
    });
});
