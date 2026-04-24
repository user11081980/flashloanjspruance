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
        if (e.code === "ERR_BAD_REQUEST" && e.response.statusText === "Forbidden") {
            console.log("RATE LIMIT REACHED. SLEEPING...");
            await utilities.sleep(constants.AMOUNTS.DELAY_AFTER_RATE_LIMIT_REACHED);
        } else if (e.code === "ERR_BAD_REQUEST" && e.response.data.error.includes("Rate limit reached")) {
            console.log("RATE LIMIT REACHED. SLEEPING...");
            await utilities.sleep(constants.AMOUNTS.DELAY_AFTER_RATE_LIMIT_REACHED);
        }
        else if (e.code === "ERR_BAD_REQUEST" && e.response.data.error.includes("No routes found with enough liquidity")) {
            console.log("NO ROUTES FOUND WITH ENOUGH LIQUIDITY");
            excludedSymbols.push(symbol);
            await utilities.sleep(constants.AMOUNTS.DELAY_BETWEEN_CALLS);
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
                await executeFlashLoanArbitrage(bridge.symbol, bridge.address, bridge.decimals);
                await utilities.sleep(constants.AMOUNTS.DELAY_BETWEEN_CALLS);
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
            await utilities.sleep(constants.AMOUNTS.DELAY_BETWEEN_CALLS);
        }
    }
    return bridges;
};

loop();