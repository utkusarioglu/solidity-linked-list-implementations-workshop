// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

contract Main {
  string private greeting;
  uint256 private counter = 0;

  constructor() {
    greeting = "Hello World!";
  }

  function getGreeting() public view returns (string memory) {
    return greeting;
  }

  function incrementCounter() public {
    counter += 1;
  }

  function getCounter() public view returns (uint256) {
    return counter;
  }
}
