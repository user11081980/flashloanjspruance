const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const constants = require("../constants/constants");
const utilities = require("../utils/utilities");

async function executeFlashLoanArbitrage(symbol, address) {
    try {
        const response1 = await utilities.oneInchSwap({
            src: constants.ADDRESSES.WBNB,
            dst: constants.ADDRESSES.LINK,
            amount: ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS).toString(),
            from: constants.ADDRESSES.FLASH_LOAN_ARBITRAGE,
            slippage: 2,
            disableEstimate: "true"
        });

        const amountBigNumber = BigNumber.from(response1.dstAmount);
        const response2 = await utilities.oneInchSwap({
            src: constants.ADDRESSES.LINK,
            dst: constants.ADDRESSES.WBNB,
            amount: amountBigNumber.toString(), // .mul(700).div(1000).toString() Consider creating a variable, where 700 stands for 70.0%
            from: constants.ADDRESSES.FLASH_LOAN_ARBITRAGE,
            slippage: 2,
            disableEstimate: "true"
        });

        //amountBigNumber = BigNumber.from(response2.dstAmount);
        // check amountBigNumber.gt(BORROW_AMOUNT_BIG_NUMBER) + fee
        // send notification
        const flashLoanContract = await ethers.getContractAt("FlashLoanArbitrage", constants.ADDRESSES.FLASH_LOAN_ARBITRAGE);
        await flashLoanContract.requestFlashLoan(
            constants.ADDRESSES.WBNB,
            ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS),
            ethers.utils.defaultAbiCoder.encode(["bytes", "bytes", "address"], [response1.tx.data, response2.tx.data, constants.ADDRESSES.LINK]));
    } catch (e) {
        console.log({
            reason: e.reason,
            code: e.code,
            method: e.method
        });
    }
}

/*async function loop() {
    while (true) {
        for (const [symbol, address] of Object.entries(INTERMEDIATES)) {
            await performFlashSwap(symbol, address);
            await new Promise(resolve => setTimeout(resolve, 4000)); // Consider using a variable.
        }
    }
}

loop();*/

executeFlashLoanArbitrage();