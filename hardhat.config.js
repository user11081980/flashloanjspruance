require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
            accounts: [ process.env.METAMASK_PRIVATE_KEY ], // the MetaMask private key, not to be confused with the MetaMask address
        }
    },
};
