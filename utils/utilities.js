const { network, ethers } = require("hardhat");
const axios = require("axios");
const IERC20 = require("@openzeppelin/contracts/build/contracts/IERC20.json");
const constants = require("../constants/constants");

const impersonateFundErc20 = async (senderAddress, recipientAddress, tokenAddress, amountToFund) => {
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [senderAddress],
    });

    const tokenContract = new ethers.Contract(tokenAddress, IERC20.abi, ethers.provider);
    const senderSigner = await ethers.getSigner(senderAddress);
    await tokenContract.connect(senderSigner).transfer(recipientAddress, ethers.utils.parseUnits(amountToFund, constants.AMOUNTS.NUMBER_OF_DECIMALS));

    await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [senderAddress],
    });
};

const oneInchSwap = async (params) => {
    const response = await axios.get(`https://api.1inch.dev/swap/v6.0/${constants.KEYS.BNB_CHAIN_ID}/swap`,
        {
            params,
            headers: { "Authorization": `Bearer ${constants.KEYS.ONE_INCH}` }
        });
    return response.data;
};

module.exports = {
    impersonateFundErc20: impersonateFundErc20,
    oneInchSwap: oneInchSwap
};
