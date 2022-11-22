// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "../src/contracts/SllAsStructs.sol";

contract SllAsStructsFuzz is SllAsStructs {
  constructor() SllAsStructs() {}

  function echidna_HeapLengthBiggerThan0() public view returns (bool) {
    return getHeap().length >= 0;
  }

  function echidna_HeapLengthAlwaysLeThanChainLength()
    public
    view
    returns (bool)
  {
    uint256 heapLength = getHeap().length;
    uint256 chainLength = getChainLength();
    return heapLength >= chainLength;
  }

  function echidna_HeadPtrAndZerothNodeAreTheSame() public view returns (bool) {
    int256 zerothNode = getNthPtrFromHead(0);
    int256 headPtr = getHeadPtr();
    return headPtr == zerothNode;
  }

  /// @dev
  /// this one will cause errors if the chain is split or if the
  /// chain is empty
  function echidna_TailPtrAndLastChainElemAreTheSame()
    public
    view
    returns (bool)
  {
    int256 zerothFromTailPtr = getNthPtrFromTail(0);
    uint256 chainLength = getChainLength();
    int256 lastFromHeadPtr = getNthPtrFromHead(chainLength - 1);
    return zerothFromTailPtr == lastFromHeadPtr;
  }
}
