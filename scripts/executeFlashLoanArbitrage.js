const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const constants = require("../constants/constants");
const utilities = require("../utils/utilities");
const dexScreenerScrapper = require("../utils/dexScreenerScraper");

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
        const bridges = (await dexScreenerScrapper.scrapeTrendingPairs(constants.URLS.TRENDING_PAIRS_6HOURS_1000000LIQUIDITY)).map(x => x.baseToken);
        for (const bridge of bridges) {
            await executeFlashLoanArbitrage(bridge.symbol, bridge.address);
            await new Promise(resolve => setTimeout(resolve, 4000)); // Consider using a variable.
        }
    }
}

loop();