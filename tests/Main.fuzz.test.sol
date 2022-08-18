// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../src/contracts/Main.sol";

contract MainFuzz is Main {
  constructor() Main() {}

  function echidna_counterBiggerThan0() public view returns (bool) {
    return (Main.getCounter() + 1) > 0;
  }

  function echidna_greetingIsConsistent() public view returns (bool) {
    return
      keccak256(abi.encodePacked(Main.getGreeting())) ==
      keccak256(abi.encodePacked("Hello World!"));
  }
}
