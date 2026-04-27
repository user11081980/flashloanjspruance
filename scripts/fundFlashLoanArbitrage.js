const { ethers } = require("hardhat");
const constants = require("../constants/constants");
require("dotenv").config();

async function main() {
    const provider = ethers.provider;
    const wallet = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, provider);

    const targetAddress = constants.ADDRESSES.ARBITRUM.POOL_ADDRESSES_PROVIDER;
    const wethAbi = [
        ...constants.ABIS.IERC20_METADATA,
        "function transfer(address to, uint256 amount) returns (bool)"
    ];

    const weth = new ethers.Contract(constants.ADDRESSES.ARBITRUM.WETH, wethAbi, wallet);
    const amountToSend = ethers.utils.parseUnits("0.0008", constants.AMOUNTS.NUMBER_OF_DECIMALS);

    const beforeBalance = await weth.balanceOf(targetAddress);
    console.log("Contract balance before:", ethers.utils.formatUnits(beforeBalance, constants.AMOUNTS.NUMBER_OF_DECIMALS), "WETH");

    const tx = await weth.transfer(targetAddress, amountToSend);
    await tx.wait();

    const afterBalance = await weth.balanceOf(targetAddress);
    console.log("Contract balance after:", ethers.utils.formatUnits(afterBalance, constants.AMOUNTS.NUMBER_OF_DECIMALS), "WETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
