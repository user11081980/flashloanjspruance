const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const { constructSimpleSDK } = require("@velora-dex/sdk");
const axios = require("axios");
const hre = require("hardhat");
const constants = require("../constants/constants");
const utilities = require("../utils/utilities");
const dexScreenerScrapper = require("../utils/dexScreenerScraper");
require("dotenv").config();

console.log(`${hre.network.name} NETWORK`);

const sdk = constructSimpleSDK({ chainId: constants.KEYS.BNB_CHAIN_ID, axios: axios });
const excludedSymbols = [];

async function executeFlashLoanArbitrage(symbol, address, decimals) {
    try {
        console.log(`WBNB/${symbol}/WBNB`);

        const startingAmountBigNumber = ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS);
        const rate1 = await sdk.swap.getRate({
            srcToken: constants.ADDRESSES.WBNB,
            srcDecimals: constants.AMOUNTS.NUMBER_OF_DECIMALS,
            destToken: address,
            destDecimals: decimals,
            amount: startingAmountBigNumber.toString(),
            userAddress: process.env.METAMASK_BNB_CHAIN_ADDRESS,
            side: "SELL",
            maxImpact: 100,
        });

        const rate2 = await sdk.swap.getRate({
            srcToken: address,
            srcDecimals: decimals,
            destToken: constants.ADDRESSES.WBNB,
            destDecimals: constants.AMOUNTS.NUMBER_OF_DECIMALS,
            amount: rate1.destAmount,
            userAddress: process.env.METAMASK_BNB_CHAIN_ADDRESS,
            side: "SELL",
            maxImpact: 100,
        });

        const endingAmountBigNumber = BigNumber.from(rate2.destAmount);
        console.log(startingAmountBigNumber.toString());
        console.log(endingAmountBigNumber.toString());

        if (endingAmountBigNumber.gt(startingAmountBigNumber)) {
            console.log(`WBNB/${symbol}/WBNB ARBITRAGE FOUND!`);
            utilities.pushover(`WBNB/${symbol}/WBNB ARBITRAGE FOUND!`);
            const transaction1 = await sdk.swap.buildTx({
                srcToken: constants.ADDRESSES.WBNB,
                destToken: address,
                srcAmount: startingAmountBigNumber.toString(),
                priceRoute: rate1,
                userAddress: process.env.METAMASK_BNB_CHAIN_ADDRESS,
                partner: "user11081980",
                slippage: 50, // 0.5%
                ignoreChecks: true
            });
            const transaction2 = await sdk.swap.buildTx({
                srcToken: address,
                destToken: constants.ADDRESSES.WBNB,
                srcAmount: rate2.srcAmount,
                priceRoute: rate2,
                userAddress: process.env.METAMASK_BNB_CHAIN_ADDRESS,
                partner: "user11081980",
                slippage: 50, // 0.5%
                ignoreChecks: true
            });
        }
    } catch (e) {
        // TODO: ADD TO EXCLUDED SYMBOLS BASED ON THE ERRORS THAT I SEE
        // code: ERR_BAD_REQUEST
        // data.error network. Supported chains: 1, 10, 56, 100, 130, 137, 146, 8453, 42161, 43114
        console.log(e.code, e.response.data.error);
    }
}

async function loop() {
    while (true) {
        console.log("COLLECTING URLS...");
        const bridges = await getBridges();
        console.log(`${bridges.length} URLS COLLECTED`);
        for (const bridge of bridges) {
            if (!excludedSymbols.includes(bridge.symbol)) {
                await executeFlashLoanArbitrage(bridge.symbol, bridge.address, bridge.decimals);
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