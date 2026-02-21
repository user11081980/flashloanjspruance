const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const constants = require("../constants/constants");
const utilities = require("../utils/utilities");

const BRIDGES = {
    "CAKE": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    "LINK": "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    "MATIC": "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
    "UNI": "0xbf5140a22578168fd562dccf235e5d43a02ce9b1",
    "XRP": "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe",
    "ADA": "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47",
    "DOGE": "0xba2ae424d960c26247dd6c32edc70b295c744c43",
    "U": "0xcE24439F2D9C6a2289F741120FE202248B666666",
    "KGST": "0x94be0bbA8E1E303fE998c9360B57b826F1A4f828"
};

async function executeFlashLoanArbitrage(symbol, address) {
    try {
        console.log(`WBNB/${symbol}/WBNB`);

        const startingAmountBigNumber = ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS);
        const response1 = await utilities.oneInchSwap({
            src: constants.ADDRESSES.WBNB,
            dst: address,
            amount: startingAmountBigNumber.toString(),
            from: constants.ADDRESSES.FLASH_LOAN_ARBITRAGE,
            slippage: 2,
            disableEstimate: "true"
        });

        const bridgeAmountBigNumber = BigNumber.from(response1.dstAmount);
        const response2 = await utilities.oneInchSwap({
            src: address,
            dst: constants.ADDRESSES.WBNB,
            amount: bridgeAmountBigNumber.toString(), // .mul(700).div(1000).toString() Consider creating a variable, where 700 stands for 70.0%
            from: constants.ADDRESSES.FLASH_LOAN_ARBITRAGE,
            slippage: 2,
            disableEstimate: "true"
        });

        const endingAmountBigNumber = BigNumber.from(response2.dstAmount);
        console.log(startingAmountBigNumber.toString());
        console.log(endingAmountBigNumber.toString());
        if (endingAmountBigNumber.gt(startingAmountBigNumber)) {
            console.log(`WBNB/${symbol}/WBNB ARBITRAGE FOUND!`);
            utilities.pushover(`WBNB/${symbol}/WBNB ARBITRAGE FOUND!`);
            const flashLoanContract = await ethers.getContractAt("FlashLoanArbitrage", constants.ADDRESSES.FLASH_LOAN_ARBITRAGE);
            await flashLoanContract.requestFlashLoan(
                constants.ADDRESSES.WBNB,
                ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS),
                ethers.utils.defaultAbiCoder.encode(["bytes", "bytes", "address"], [response1.tx.data, response2.tx.data, address]));
        }
    } catch (e) {
        console.log({
            reason: e.reason,
            code: e.code,
            method: e.method
        });
    }
}

async function loop() {
    while (true) {
        for (const [symbol, address] of Object.entries(BRIDGES)) {
            await executeFlashLoanArbitrage(symbol, address);
            await new Promise(resolve => setTimeout(resolve, 4000)); // Consider using a variable.
        }
    }
}

loop();