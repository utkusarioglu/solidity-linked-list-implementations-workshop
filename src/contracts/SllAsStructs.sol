// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "hardhat/console.sol";

struct SllNode {
  uint256 value;
  int256 next;
}

error NoSuchMethod();
error NoPaymentRequired();
error EmptyList();
error Overflow(uint256 index);
error Underflow();

contract SllAsStructs {
  SllNode[] private heap;
  int256 private constant NULL_PTR = -1;
  int256 private headPtr = -1; // = NULL_PTR

  receive() external payable {
    revert NoPaymentRequired();
  }

  fallback() external {
    revert NoSuchMethod();
  }

  modifier revertsIfEmpty() {
    if (headPtr == NULL_PTR) {
      revert EmptyList();
    }
    _;
  }

  event AddNode(uint256 value);

  function addNode(uint256 value) external {
    SllNode memory newNode = SllNode(value, NULL_PTR);

    emit AddNode(value);
    console.log("Add value", value);

    heap.push(newNode);

    if (headPtr == NULL_PTR) {
      headPtr = 0;
    } else {
      int256 tailPtr = getTailPtr();
      SllNode storage tail = heap[uint256(tailPtr)];
      tail.next = int256(heap.length - 1);
    }
  }

  function getChainLength() public view returns (uint256) {
    uint256 count = 0;
    int256 currentPtr = headPtr;
    while (currentPtr != NULL_PTR) {
      count += 1;
      currentPtr = heap[uint256(currentPtr)].next;
    }
    return count;
  }

  function getHeapLength() external view returns (uint256) {
    return heap.length;
  }

  function getHeap() public view returns (SllNode[] memory) {
    return heap;
  }

  function getHeadPtr() public view returns (int256) {
    return headPtr;
  }

  function getHead() external view revertsIfEmpty returns (SllNode memory) {
    return heap[uint256(headPtr)];
  }

  function getTailPtr() private view revertsIfEmpty returns (int256) {
    int256 currentPtr = headPtr;
    int256 tailPtr = currentPtr;
    while (currentPtr != NULL_PTR) {
      tailPtr = currentPtr;
      currentPtr = heap[uint256(currentPtr)].next;
    }
    return tailPtr;
  }

  function getTail() external view returns (SllNode memory) {
    return heap[uint256(getTailPtr())];
  }

  function getNthPtrFromNode(
    int256 startPtr,
    uint256 index
  ) private view returns (int256) {
    uint256 counter = 1;
    int256 currentPtr = startPtr;
    while (index > counter) {
      currentPtr = heap[uint256(currentPtr)].next;
      counter += 1;
    }
    return currentPtr;
  }

  function getNthPtrFromHead(
    uint256 index
  ) internal view revertsIfEmpty returns (int256) {
    int256 targetPtr = getNthPtrFromNode(headPtr, index);
    return targetPtr;
  }

  function getNthFromHead(
    uint256 index
  ) external view returns (SllNode memory) {
    int256 nthPtr = getNthPtrFromHead(index);
    return heap[uint256(nthPtr)];
  }

  function getNthPtrFromTail(uint256 index) internal view returns (int256) {
    uint256 nodeCount = getChainLength();
    uint256 targetIndex = nodeCount - index;
    return getNthPtrFromHead(targetIndex);
  }

  function getNthFromTail(
    uint256 index
  ) external view returns (SllNode memory) {
    int256 nthPtrFromTail = getNthPtrFromTail(index);
    return heap[uint256(nthPtrFromTail)];
  }

  function reverse() external {
    int256 currentPtr = headPtr;
    int256 prevPtr = NULL_PTR;
    while (currentPtr != NULL_PTR) {
      SllNode storage currentNode = heap[uint256(currentPtr)];
      int256 nextPtr = currentNode.next;
      currentNode.next = prevPtr;
      prevPtr = currentPtr;
      currentPtr = nextPtr;
    }
    headPtr = prevPtr;
  }

  function reverseRecursiveStep(int256 currentPtr) private returns (int256) {
    SllNode storage current = heap[uint256(currentPtr)];
    int256 oldNext = current.next;
    if (oldNext == NULL_PTR) {
      headPtr = currentPtr;
    } else {
      current.next = reverseRecursiveStep(oldNext);
    }
    return oldNext;
  }

  function reverseRecursive() external {
    if (headPtr == NULL_PTR) {
      revert EmptyList();
    }
    reverseRecursiveStep(headPtr);
  }
}
