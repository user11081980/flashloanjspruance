const { network, ethers } = require("hardhat");

const fundErc20 = async (contract, sender, recepient, amount) => {
    const amount_to_fund = ethers.utils.parseUnits(amount, 18);
    const whale = await ethers.getSigner(sender);

    const contractSigner = contract.connect(whale);
    await contractSigner.transfer(recepient, amount_to_fund);
};

const impersonateFundErc20 = async (contract, sender, recepient, amount) => {
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [sender],
    });
    await fundErc20(contract, sender, recepient, amount);
    await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [sender],
    });
};

module.exports = {
    impersonateFundErc20: impersonateFundErc20
};
