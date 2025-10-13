// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import "../src/DogeFake.sol";

contract FaucetDogeFakeToken is Test {
    DogeFake token;
    address user = address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8);

    function setUp() public {
        token = new DogeFake(100);
    }

    function testInitialSupply() public {
        uint256 supply = token.totalSupply();
        assertEq(supply, 100 * 10 ** token.decimals());
    }

    function testFaucetSuccess() public {
        vm.prank(user);

        token.faucet();

        uint256 balance = token.balanceOf(user);
        assertEq(balance, 100 * 10 ** token.decimals(), "Should mint 100 tokens");
    }

    function testCannotClaimTwiceWithin24Hourse() public {
        vm.startPrank(user);
        token.faucet();

        vm.expectRevert(bytes("Claim once per day"));

        token.faucet();
        vm.stopPrank();
    }
}