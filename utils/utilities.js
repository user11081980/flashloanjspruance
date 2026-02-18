const { network, ethers } = require("hardhat");
const IERC20 = require("@openzeppelin/contracts/build/contracts/IERC20.json");
const constants = require("../constants/constants");

const impersonateFundErc20 = async (senderAddress, recipientAddress, tokenAddress, amountToFund) => {
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [senderAddress],
    });

    const tokenContract = new ethers.Contract(tokenAddress, IERC20.abi, waffle.provider); // Waffle is a smart contract testing library that uses JavaScript, is a part of Hardhat, and acts as a connection to the Ethereum network, where the statement waffle.provider creates a local in-memory Ethereum node
    const senderSigner = await ethers.getSigner(senderAddress);
    await tokenContract.connect(senderSigner).transfer(recipientAddress, ethers.utils.parseUnits(amountToFund, constants.AMOUNTS.NUMBER_OF_DECIMALS));

    await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [senderAddress],
    });
};

module.exports = {
    impersonateFundErc20: impersonateFundErc20
};
