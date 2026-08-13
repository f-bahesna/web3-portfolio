// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import "../src/SimpleDEX.sol";
import "../src/ArbiFake.sol";
import "../src/DogeFake.sol";

contract SimpleDEXTest is Test {
    SimpleDEX dex;
    ArbiFake arbi;
    DogeFake doge;

    address owner = address(this);
    address user = address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8);

    uint256 constant RATE = 5; // 1 arbiFake = 5 dogeFake

    function setUp() public {
        arbi = new ArbiFake(1_000_000);
        doge = new DogeFake(1_000_000);
        dex = new SimpleDEX(address(arbi), address(doge), RATE);

        // Fund the DEX with liquidity for both tokens.
        arbi.transfer(address(dex), 100_000 * 10 ** arbi.decimals());
        doge.transfer(address(dex), 100_000 * 10 ** doge.decimals());

        // Give the user some arbiFake and dogeFake to swap with.
        arbi.transfer(user, 100 * 10 ** arbi.decimals());
        doge.transfer(user, 100 * 10 ** doge.decimals());
    }

    function testSwapArbiToDoge() public {
        uint256 arbiAmount = 10 * 10 ** arbi.decimals();
        uint256 expectedDoge = arbiAmount * RATE;

        vm.startPrank(user);
        arbi.approve(address(dex), arbiAmount);
        dex.swapArbiToDoge(arbiAmount);
        vm.stopPrank();

        assertEq(doge.balanceOf(user), 100 * 10 ** doge.decimals() + expectedDoge);
        assertEq(arbi.balanceOf(user), 90 * 10 ** arbi.decimals());
    }

    function testSwapDogeToArbi() public {
        uint256 dogeAmount = 10 * 10 ** doge.decimals();
        uint256 expectedArbi = dogeAmount / RATE;

        vm.startPrank(user);
        doge.approve(address(dex), dogeAmount);
        dex.swapDogeToArbi(dogeAmount);
        vm.stopPrank();

        assertEq(arbi.balanceOf(user), 100 * 10 ** arbi.decimals() + expectedArbi);
        assertEq(doge.balanceOf(user), 90 * 10 ** doge.decimals());
    }

    function testSwapsAreInverseOfEachOther() public {
        // Swapping arbi -> doge -> arbi should return the user to (approximately)
        // their starting arbi balance, proving the two swap directions use the
        // same rate consistently instead of both multiplying by `rate`.
        uint256 arbiAmount = 10 * 10 ** arbi.decimals();
        uint256 startingArbi = arbi.balanceOf(user);

        vm.startPrank(user);
        arbi.approve(address(dex), arbiAmount);
        dex.swapArbiToDoge(arbiAmount);

        uint256 dogeReceived = doge.balanceOf(user) - (100 * 10 ** doge.decimals());
        doge.approve(address(dex), dogeReceived);
        dex.swapDogeToArbi(dogeReceived);
        vm.stopPrank();

        assertEq(arbi.balanceOf(user), startingArbi);
    }

    function testSwapArbiToDogeRevertsWhenDexHasInsufficientDoge() public {
        uint256 arbiAmount = 1_000_000 * 10 ** arbi.decimals();

        vm.startPrank(user);
        arbi.approve(address(dex), arbiAmount);
        vm.expectRevert(bytes("Not enough dogeFake in DEX"));
        dex.swapArbiToDoge(arbiAmount);
        vm.stopPrank();
    }

    function testSwapDogeToArbiRevertsWhenDexHasInsufficientArbi() public {
        uint256 dogeAmount = 1_000_000 * 10 ** doge.decimals();

        vm.startPrank(user);
        doge.approve(address(dex), dogeAmount);
        vm.expectRevert(bytes("Not enought arbiFake in DEX"));
        dex.swapDogeToArbi(dogeAmount);
        vm.stopPrank();
    }

    function testSetRateOnlyOwner() public {
        vm.prank(user);
        vm.expectRevert(bytes("Not owner"));
        dex.setRate(10);

        dex.setRate(10);
        assertEq(dex.rate(), 10);
    }

    function testWithdrawOnlyOwner() public {
        vm.prank(user);
        vm.expectRevert(bytes("Not owner"));
        dex.withdraw(address(arbi), 1);

        uint256 balanceBefore = arbi.balanceOf(owner);
        dex.withdraw(address(arbi), 1);
        assertEq(arbi.balanceOf(owner), balanceBefore + 1);
    }
}
