// contracts/FlashLoanArbitrage.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "hardhat/console.sol";
import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol"; // Required base contract for receiving flash loans.
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

contract FlashLoanArbitrage is FlashLoanSimpleReceiverBase {
    address payable owner;
    address constant ONE_INCH_ROUTER_ADDRESS = 0x111111125421cA6dc452d289314280a0f8842A65;

    constructor(address _addressProvider)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
    {
        owner = payable(msg.sender);
    }

    // This function is called after your contract has received the flash loaned amount.
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Decodes the parameters.
        (bytes memory data1, bytes memory data2, address tokenIntermediateAddress) = abi.decode(params, (bytes, bytes, address));

        // Execute the first swap to end up with the intermediate token.
        IERC20(asset).approve(ONE_INCH_ROUTER_ADDRESS, amount);
        (bool success1, bytes memory response1) = ONE_INCH_ROUTER_ADDRESS.call(data1); // 1inch gets the funds from this contract, swaps the amounts, and puts the funds back in this contract (provided that the receiver parameter of the swap API request was left blank).
        if (!success1) {
            revert(string.concat("Swap 1 failed.", getRevertReason(response1)));
        }

        // Execute the second swap to end up with the borrowed token.
        IERC20(tokenIntermediateAddress).approve(ONE_INCH_ROUTER_ADDRESS, IERC20(tokenIntermediateAddress).balanceOf(address(this)));
        (bool success2, bytes memory response2) = ONE_INCH_ROUTER_ADDRESS.call(data2);
        if (!success2) {
            revert(string.concat("Swap 2 failed.", getRevertReason(response2)));
        }

        // Repay the loan by allowing the pool to pull the owed amount.
        uint256 amountOwed = amount + premium;
        require(IERC20(asset).balanceOf(address(this)) >= amountOwed, "Amount owed exceeds balance.");
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    function requestFlashLoan(address _token, uint256 _amount, bytes calldata params) public {
        address receiverAddress = address(this);
        address asset = _token;
        uint256 amount = _amount;
        uint16 referralCode = 0; // 0 if IPool.flashLoanSimple is executed directly by the user.

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }

    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    function withdraw(address _tokenAddress) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    receive() external payable {}

    function getRevertReason(bytes memory response) internal pure returns (string memory) {
        // The response parameter contains a revert reason, where the first 4 bytes identify the type of error, and where 0x08c379a0 represents standard errors and other values represent custom errors.
        if (response.length < 4) {
            return "Unexpected revert reason.";
        }
        else if (response.length == 4) {
            return string.concat("Custom error selector.", getStringRepresentation(bytes4(response)));
        }
        else if (response.length >= 68 && bytes4(response) == bytes4(0x08c379a0)) {
            bytes memory payload = new bytes(response.length - 4);
            for (uint i = 0; i < response.length - 4; i++) {
                payload[i] = response[i + 4];
            }
            return abi.decode(payload, (string));
        }
        return "Unexpected revert format.";
    }

    function getStringRepresentation(bytes4 data) internal pure returns (string memory) {
        bytes memory s = new bytes(10); // "0x" + 8 hex chars
        s[0] = "0";
        s[1] = "x";
        bytes memory alphabet = "0123456789abcdef";
        for (uint i = 0; i < 4; i++) {
            s[2 * i + 2] = alphabet[uint(uint8(data[i] >> 4))];
            s[2 * i + 3] = alphabet[uint(uint8(data[i] & 0x0f))];
        }
        return string(s);
    }
}
