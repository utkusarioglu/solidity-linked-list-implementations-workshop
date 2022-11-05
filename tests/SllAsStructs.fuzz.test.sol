// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "../src/contracts/SllAsStructs.sol";

contract SllAsStructsFuzz is SllAsStructs {
  constructor() SllAsStructs() {}

  function echidna_HeapLengthBiggerThan0() public view returns (bool) {
    return getHeap().length > 0;
  }
}
