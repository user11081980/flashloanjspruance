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
            accounts: ["0xb0e99a694392974e26710ed672899d779fd945e58f5e8b7a4ad7c64f3c12cd2c"], // the Trust Wallet private key, not to be confused with the Trust Wallet address
        }
    },
};
