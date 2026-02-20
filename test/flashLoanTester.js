const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const constants = require("../constants/constants");
const utilities = require("../utils/utilities");

describe("Aave Flash Loan contract on Hardhat BNB Chain mainnet local forked network", () => {
    let flashLoanContract = null;

    before(async () => {
        // Deploy the smart contract to the Hardhat's local in-memory Ethereum network as provided in the network configuration. The contract must be defined in the default "contracts" directory. The returned factory has methods like deploy(), which is used to deploy the contract.
        const flashLoanContractFactory = await ethers.getContractFactory("FlashLoanArbitrage");
        flashLoanContract = await flashLoanContractFactory.deploy(constants.ADDRESSES.POOL_ADDRESSES_PROVIDER);
        await flashLoanContract.deployed();
    });

    xit("should successfully complete the flash loan", async () => {
        // Fund the contract so that it can repay the loan. This function impersonates the whale, sends funds to the contract, and stops impersonating the whale.
        await utilities.impersonateFundErc20(
            constants.ADDRESSES.WHALE_WBNB,
            flashLoanContract.address,
            constants.ADDRESSES.WBNB,
            constants.AMOUNTS.AMOUNT_TO_FUND
        );
        expect(await flashLoanContract.getBalance(constants.ADDRESSES.WBNB)).to.be.above(0);

        await flashLoanContract.requestFlashLoan(
            constants.ADDRESSES.WBNB,
            ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS));
    });

    it("should fail to complete the flash loan", async () => {
        // Fund the contract so that it can repay the loan. This function impersonates the whale, sends funds to the contract, and stops impersonating the whale.
        await utilities.impersonateFundErc20(
            constants.ADDRESSES.WHALE_WBNB,
            flashLoanContract.address,
            constants.ADDRESSES.WBNB,
            constants.AMOUNTS.AMOUNT_TO_FUND
        );
        expect(await flashLoanContract.getBalance(constants.ADDRESSES.WBNB)).to.be.above(0);

        const response1 = await utilities.oneInchSwap({
            src: constants.ADDRESSES.WBNB,
            dst: constants.ADDRESSES.LINK,
            amount: ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS).toString(),
            from: flashLoanContract.address,
            slippage: 0.5,
            disableEstimate: "true"
        });

        const amountBigNumber = BigNumber.from(response1.dstAmount);
        const response2 = await utilities.oneInchSwap({
            src: constants.ADDRESSES.LINK,
            dst: constants.ADDRESSES.WBNB,
            amount: amountBigNumber, // .mul(700).div(1000).toString() Consider creating a variable, where 700 stands for 70.0%
            from: flashLoanContract.address,
            slippage: 0.5,
            disableEstimate: "true"
        });

        await flashLoanContract.requestFlashLoan(
            constants.ADDRESSES.WBNB,
            ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS),
            ethers.utils.defaultAbiCoder.encode(["bytes", "bytes", "address"], [response1.tx.data, response2.tx.data, constants.ADDRESSES.LINK]));
        
        console.log("Borrowd:", ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS));
        console.log("Balance:", await flashLoanContract.getBalance(constants.ADDRESSES.WBNB));
    });
});
