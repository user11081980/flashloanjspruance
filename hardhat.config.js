const { extendEnvironment } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

extendEnvironment((hre) => {
    const originalLog = console.log;
    const originalError = console.error;
    const getTimestamp = () => `[${new Date().toLocaleTimeString()}]`;
    console.log = (...args) => { // rest syntax in parameter collects multiple items into one array
        originalLog.apply(console, [getTimestamp(), ...args]); // spread syntax in call unpacks an array into individual items
    };
    console.error = (...args) => {
        originalError.apply(console, [getTimestamp(), ...args]);
    };
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            forking: {
                "url": "https://bnb-mainnet.g.alchemy.com/v2/4aw-gp2kgdQQvI3kb1UNN"
            },
            chainId: 56
        },
        mainnet: {
            url: "https://bsc-dataseed.binance.org/",
            chainId: 56,
            accounts: [process.env.METAMASK_PRIVATE_KEY], // the MetaMask private key, not to be confused with the MetaMask address
        }
    },
};
