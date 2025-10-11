// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/SimpleDEX.sol";

contract DeploySimpleDEX is Script {
    function run() external {
        vm.startBroadcast();

        address ArbiFake = 0xa5BfFc041dAf37E0a9194cd9e16cD08D671Cf82b;
        address DogeFake = 0x1E19693f4403D9EAB0a67238Ed500CF5962FC299;

        uint256 rate = 1;

        SimpleDEX dex = new SimpleDEX(ArbiFake, DogeFake, rate);

        console.log("SimpleDEX deployed at: ", address(dex));

        vm.stopBroadcast();
    }
}