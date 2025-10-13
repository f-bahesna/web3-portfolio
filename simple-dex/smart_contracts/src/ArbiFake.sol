// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArbiFake is ERC20 {
    mapping(address => bool) public claimed;
    mapping(address => uint256) public lastClaim;

    constructor(uint256 supply) ERC20("ArbiFake", "AFAKE") {
        _mint(msg.sender, supply * 10 ** decimals());
    }

    function faucet() external {
        // allow first claim OR following claims after 1 day
        require(lastClaim[msg.sender] == 0 || block.timestamp - lastClaim[msg.sender] >= 1 days, "Claim once per day");
        
        lastClaim[msg.sender] = block.timestamp;
        claimed[msg.sender] = true;

        _mint(msg.sender, 10 * 10 ** decimals());
    }
}