const { expect } = require("chai");
const { ethers } = require("hardhat");
const constants = require("../constants/constants");
const utilities = require("../utils/utilities");

describe("Aave Flash Loan contract on Hardhat BNB Chain mainnet local forked network", () => {
    let flashLoanContract = null;

    before(async () => {
        // Deploy the smart contract to the Hardhat's local in-memory Ethereum network as provided in the network configuration. The contract must be defined in the default "contracts" directory. The returned factory has methods like deploy(), which is used to deploy the contract.
        const flashLoanContractFactory = await ethers.getContractFactory("FlashLoan");
        flashLoanContract = await flashLoanContractFactory.deploy(constants.ADDRESSES.POOL_ADDRESSES_PROVIDER);
        await flashLoanContract.deployed();
    });

    it("should fail to request flash loan", async () => {
        // Fund the contract so that it can repay the loan. This function impersonates the whale, sends funds to the contract, and stops impersonating the whale.
        await utilities.impersonateFundErc20(
            constants.ADDRESSES.WHALE_WBNB,
            flashLoanContract.address,
            constants.ADDRESSES.WBNB,
            constants.AMOUNTS.AMOUNT_TO_FUND
        );
        expect(await flashLoanContract.getBalance(constants.ADDRESSES.WBNB)).to.be.above(0);

        return;

        await flashLoanContract.requestFlashLoan(
            constants.ADDRESSES.WBNB,
            ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS));
    });
});
