// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/DogeFake.sol";

contract DeployDogeFake is Script {
    function run() external {
        vm.startBroadcast();

        uint256 initialSupply = 1_000_000 ether;
        DogeFake token = new DogeFake(initialSupply);

        console.log("DogeFake deployed at: ", address(token));

        vm.stopBroadcast();
    }
}