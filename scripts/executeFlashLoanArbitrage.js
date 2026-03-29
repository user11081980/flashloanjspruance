const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const hre = require("hardhat");
const constants = require("../constants/constants");
const utilities = require("../utils/utilities");
const dexScreenerScrapper = require("../utils/dexScreenerScraper");

console.log(`${hre.network.name} NETWORK`);

const excludedSymbols = [];

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
        if (e.code === "ERR_BAD_REQUEST") {
            excludedSymbols.push(symbol);
        }
    }
}

async function loop() {
    while (true) {
        console.log("COLLECTING URLS...");
        const bridges = await getBridges();
        console.log(`${bridges.length} URLS COLLECTED`);
        for (const bridge of bridges) {
            if (!excludedSymbols.includes(bridge.symbol)) {
                await executeFlashLoanArbitrage(bridge.symbol, bridge.address);
                await sleep(constants.AMOUNTS.DELAY);
            }
        }
    }
}

async function getBridges() {
    const bridges = [];
    for (const url of constants.URLS.DEXSCREENER) {
        try {
            const temp = (await dexScreenerScrapper.scrapeTrendingPairs(url)).map(x => x.baseToken);
            bridges.push(...temp);
        } catch {
            await sleep(constants.AMOUNTS.DELAY);
        }
    }
    return bridges;
};

function sleep(delay) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

const log = console.log;
console.log = (...args) => { // rest syntax in parameter collects multiple items into one array
    const timestamp = new Date().toISOString();
    log(`[${timestamp}]`, ...args); // spread syntax in call unpacks an array into individual items
};

loop();