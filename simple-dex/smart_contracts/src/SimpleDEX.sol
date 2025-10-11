// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleDEX {
    IERC20 public arbiFake;
    IERC20 public dogeFake;
    address public owner;
    uint256 public rate; //1 arbiFake = rate dogeFake

    event Swap(address indexed user, address fromToken, address toToken, uint256 fromAmount, uint256 toAmount);

    constructor(address _arbiFake, address _dogeFake, uint256 _rate){
        arbiFake = IERC20(_arbiFake);
        dogeFake = IERC20(_dogeFake);
        owner = msg.sender;
        rate = _rate;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setRate(uint256 _rate) external onlyOwner {
        rate = _rate;
    }

    function swapArbiToDoge(uint256 arbiAmount) external {
        uint256 dogeAmount = arbiAmount * rate;

        require(dogeFake.balanceOf(address(this)) >= dogeAmount, "Not enough dogeFake in DEX");
        require(arbiFake.transferFrom(msg.sender, address(this), arbiAmount), "arbiFake transfer failed");
        require(dogeFake.transfer(msg.sender, dogeAmount), "dogeFake transfer failed");

        emit Swap(msg.sender, address(arbiFake), address(dogeFake), arbiAmount, dogeAmount);
    }

    function swapDogeToArbi(uint dogeAmount) external {
        uint256 arbiAmount = dogeAmount * rate;

        require(arbiFake.balanceOf(address(this)) >= arbiAmount, "Not enought arbiFake in DEX");
        require(dogeFake.transferFrom(msg.sender, address(this), dogeAmount), "dogeFake transfer failed");
        require(arbiFake.transfer(msg.sender, arbiAmount), "arbiFake transfer failed");

        emit Swap(msg.sender, address(dogeFake), address(arbiFake), dogeAmount, arbiAmount);
    }

    function withdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}