require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.10",
    networks: {
        hardhat: {
            forking: {
                "url": "https://bnb-mainnet.g.alchemy.com/v2/4aw-gp2kgdQQvI3kb1UNN"
            },
        },
        goerli: {
            url: process.env.INFURA_GOERLI_ENDPOINT,
            accounts: [process.env.PRIVATE_KEY],
        },
    },
};
