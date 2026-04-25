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

const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
const sdk = constructSimpleSDK({ chainId: constants.KEYS.ARBITRUM_ID, axios: axios });
const excludedSymbols = [];

async function executeFlashLoanArbitrage(symbol, address, decimals) {
    try {
        console.log(`WETH/${symbol}/WETH`);

        const startingAmountBigNumber = ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS);
        const rate1 = await sdk.swap.getRate({
            srcToken: constants.ADDRESSES.ARBITRUM.WETH,
            srcDecimals: constants.AMOUNTS.NUMBER_OF_DECIMALS,
            destToken: address,
            destDecimals: decimals,
            amount: startingAmountBigNumber.toString(),
            userAddress: process.env.METAMASK_ARBITRUM_ADDRESS,
            side: "SELL",
            maxImpact: 100,
        });

        const rate2 = await sdk.swap.getRate({
            srcToken: address,
            srcDecimals: decimals,
            destToken: constants.ADDRESSES.ARBITRUM.WETH,
            destDecimals: constants.AMOUNTS.NUMBER_OF_DECIMALS,
            amount: rate1.destAmount,
            userAddress: process.env.METAMASK_ARBITRUM_ADDRESS,
            side: "SELL",
            maxImpact: 100,
        });

        const endingAmountBigNumber = BigNumber.from(rate2.destAmount);
        console.log(startingAmountBigNumber.toString());
        console.log(endingAmountBigNumber.toString());

        if (endingAmountBigNumber.gt(startingAmountBigNumber)) {
            console.log(`WETH/${symbol}/WETH ARBITRAGE FOUND!`);
            utilities.pushover(`WETH/${symbol}/WETH ARBITRAGE FOUND!`);
            const transaction1 = await sdk.swap.buildTx({
                srcToken: constants.ADDRESSES.ARBITRUM.WETH,
                destToken: address,
                srcAmount: startingAmountBigNumber.toString(),
                priceRoute: rate1,
                userAddress: process.env.METAMASK_ARBITRUM_ADDRESS,
                partner: "user11081980",
                slippage: 50, // 0.5%
                ignoreChecks: true
            });
            const transaction2 = await sdk.swap.buildTx({
                srcToken: address,
                destToken: constants.ADDRESSES.ARBITRUM.WETH,
                srcAmount: rate2.srcAmount,
                priceRoute: rate2,
                userAddress: process.env.METAMASK_ARBITRUM_ADDRESS,
                partner: "user11081980",
                slippage: 50, // 0.5%
                ignoreChecks: true
            });

            const flashLoanContract = await ethers.getContractAt("FlashLoanArbitrage2", constants.ADDRESSES.ARBITRUM.FLASH_LOAN_ARBITRAGE);
            await flashLoanContract.requestFlashLoan(
                constants.ADDRESSES.ARBITRUM.WETH,
                ethers.utils.parseUnits(constants.AMOUNTS.AMOUNT_TO_BORROW, constants.AMOUNTS.NUMBER_OF_DECIMALS),
                ethers.utils.defaultAbiCoder.encode(["bytes", "bytes", "address"], [transaction1.data, transaction2.data, address]));
        }
    } catch (e) {
        // Retry later
        if (e.code === "ERR_BAD_REQUEST" && e.response.statusText === "Forbidden") {
            console.log("RATE LIMIT REACHED. SLEEPING...");
            await utilities.sleep(constants.AMOUNTS.DELAY_AFTER_RATE_LIMIT_REACHED);
        }
        else if (e.code === "ERR_BAD_REQUEST" && e.response.data.error.includes("Rate limit reached")) {
            console.log("RATE LIMIT REACHED. SLEEPING...");
            await utilities.sleep(constants.AMOUNTS.DELAY_AFTER_RATE_LIMIT_REACHED);
        }
        // Exclude
        else if (e.code === "ERR_BAD_REQUEST" && e.response.data.error.includes("No routes found with enough liquidity")) {
            console.log("NO ROUTES FOUND WITH ENOUGH LIQUIDITY");
            excludedSymbols.push(symbol);
        } else if (e.code === "ERR_BAD_REQUEST" && e.response.statusText === "Not Found") {
            console.log(`TOKEN NOT FOUND: ${address}`);
            excludedSymbols.push(symbol);
        } else {
            console.log(e);
        }
    }
}

async function loop() {
    const contract = new ethers.Contract("0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8", constants.ABIS.IERC20_METADATA, provider);
    const decimals = await contract.decimals();
    await executeFlashLoanArbitrage("aArbWETH", "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8", decimals);
    return;
    while (true) {
        console.log("COLLECTING URLS...");
        const bridges = await getBridges();
        console.log(`${bridges.length} URLS COLLECTED`);
        for (const bridge of bridges) {
            if (!excludedSymbols.includes(bridge.symbol)) {
                if (!bridge.decimals) {
                    const contract = new ethers.Contract(bridge.address, constants.ABIS.IERC20_METADATA, provider);
                    bridge.decimals = await contract.decimals();
                }
                await executeFlashLoanArbitrage(bridge.symbol, bridge.address, bridge.decimals);
                await utilities.sleep(constants.AMOUNTS.DELAY_BETWEEN_CALLS);
            }
        }
    }
}

async function getBridges() {
    const bridges = [];
    for (const url of constants.URLS.ARBITRUM.DEXSCREENER) {
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