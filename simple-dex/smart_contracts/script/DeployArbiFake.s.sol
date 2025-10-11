// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/ArbiFake.sol";

contract DeployArbiFake is Script {
    function run() external {
        vm.startBroadcast();

        uint256 initialSupply = 1_000_000 ether;
        ArbiFake token = new ArbiFake(initialSupply);

        console.log("ArbiFake deployed at: ", address(token));

        vm.stopBroadcast();
    }
}