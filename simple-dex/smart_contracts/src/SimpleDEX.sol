// SPDX-License-Identifier: MIT
// Specify the SPDX license identifier for the contract
pragma solidity ^0.8.0;
// Set the compiler version to 0.8.0 or newer

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Import the IERC20 interface from OpenZeppelin to interact with ERC20 tokens

contract SimpleDEX {
// Define the contract named SimpleDEX
    IERC20 public arbiFake;
    // Declare a public variable for the first ERC20 token (arbiFake)
    IERC20 public dogeFake;
    // Declare a public variable for the second ERC20 token (dogeFake)
    address public owner;
    // Declare a public variable to store the address of the contract owner
    uint256 public rate; //1 arbiFake = rate dogeFake
    // Declare a public variable to store the exchange rate

    event Swap(address indexed user, address fromToken, address toToken, uint256 fromAmount, uint256 toAmount);
    // Declare an event to log swap transactions

    constructor(address _arbiFake, address _dogeFake, uint256 _rate){
    // Constructor function that runs once upon contract deployment
        arbiFake = IERC20(_arbiFake);
        // Initialize the arbiFake token contract instance
        dogeFake = IERC20(_dogeFake);
        // Initialize the dogeFake token contract instance
        owner = msg.sender;
        // Set the contract deployer as the owner
        rate = _rate;
        // Set the initial exchange rate
    }
    // End of constructor

    modifier onlyOwner(){
    // Define a modifier to restrict access to owner-only functions
        require(msg.sender == owner, "Not owner");
        // Check if the caller is the owner, revert if not
        _;
        // Continue execution of the modified function
    }
    // End of modifier

    function setRate(uint256 _rate) external onlyOwner {
    // Function to update the exchange rate, callable only by the owner
        rate = _rate;
        // Update the rate variable
    }
    // End of setRate function

    function swapArbiToDoge(uint256 arbiAmount) external {
    // Function to swap arbiFake tokens for dogeFake tokens
        uint256 dogeAmount = arbiAmount * rate;
        // Calculate the equivalent dogeFake amount based on the rate

        require(dogeFake.balanceOf(address(this)) >= dogeAmount, "Not enough dogeFake in DEX");
        // Ensure the DEX contract has enough dogeFake to send to the user
        require(arbiFake.transferFrom(msg.sender, address(this), arbiAmount), "arbiFake transfer failed");
        // Transfer arbiFake from the user to the DEX contract
        require(dogeFake.transfer(msg.sender, dogeAmount), "dogeFake transfer failed");
        // Transfer dogeFake from the DEX contract to the user

        emit Swap(msg.sender, address(arbiFake), address(dogeFake), arbiAmount, dogeAmount);
        // Emit the Swap event
    }
    // End of swapArbiToDoge function

    function swapDogeToArbi(uint dogeAmount) external {
    // Function to swap dogeFake tokens for arbiFake tokens
        uint256 arbiAmount = dogeAmount / rate;
        // Calculate the equivalent arbiFake amount based on the rate (inverse of swapArbiToDoge)

        require(arbiFake.balanceOf(address(this)) >= arbiAmount, "Not enought arbiFake in DEX");
        // Ensure the DEX contract has enough arbiFake to send to the user
        require(dogeFake.transferFrom(msg.sender, address(this), dogeAmount), "dogeFake transfer failed");
        // Transfer dogeFake from the user to the DEX contract
        require(arbiFake.transfer(msg.sender, arbiAmount), "arbiFake transfer failed");
        // Transfer arbiFake from the DEX contract to the user

        emit Swap(msg.sender, address(dogeFake), address(arbiFake), dogeAmount, arbiAmount);
        // Emit the Swap event
    }
    // End of swapDogeToArbi function

    function withdraw(address token, uint256 amount) external onlyOwner {
    // Function to allow the owner to withdraw tokens from the contract
        IERC20(token).transfer(owner, amount);
        // Transfer the specified amount of the given token to the owner
    }
    // End of withdraw function
}
// End of contract