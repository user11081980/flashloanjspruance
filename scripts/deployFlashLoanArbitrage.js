const constants = require("../constants/constants");

async function main() {
    const [deployer] = await ethers.getSigners(); // the RHS returns an array of signers where each represents an Ethereum account, whereas the LHS performs destructuring to assign just the first signer to a constant.
    console.log("Deploying contract with the account: ", deployer.address);
    console.log("Account balance: ", (await deployer.getBalance()).toString());

    const contractFactory = await ethers.getContractFactory("FlashLoanArbitrage");
    const contract = await contractFactory.deploy(constants.ADDRESSES.POOL_ADDRESSES_PROVIDER); // Argument is passed to the constructor of the smart contract
    await contract.deployed();

    console.log("Contract address: ", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
