// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

error EmptyList();
error ExistingList();
error Overflow(uint256 index);

/// @title Single Linked List with each node as contracts
/// @author Utku Sarioglu
/// @notice Holds record of the head node, facilitates navigation along the list
/// @dev There is still quite a bit of functionality that could be implemented in this contract
contract SllAsContracts {
  SllNode private head;

  event AddSllNode(SllNode ptr, bytes32 data, bool isHead);

  function isContract(address contractAddress) internal view returns (bool) {
    uint256 size;
    assembly {
      size := extcodesize(contractAddress)
    }
    return size > 0;
  }

  function addNode(bytes32 data) external {
    SllNode newSllNode = new SllNode(data);
    bool headExists = isContract(address(head));
    if (!headExists) {
      head = newSllNode;
    } else {
      SllNode tail = getTail();
      tail.setNext(newSllNode);
    }
    emit AddSllNode(newSllNode, data, !headExists);
  }

  function getLength() public view returns (uint256) {
    if (!isContract(address(head))) {
      return 0;
    }
    uint256 counter = 0;
    for (
      SllNode current = head;
      isContract(address(current));
      current = current.getNext()
    ) {
      counter++;
    }
    return counter;
  }

  function getHead() public view returns (SllNode) {
    return head;
  }

  function getTail() public view returns (SllNode) {
    if (!isContract(address(head))) {
      revert EmptyList();
    }
    SllNode tail = head;
    for (
      SllNode current = tail;
      isContract(address(current));
      current = current.getNext()
    ) {
      tail = current;
    }
    return tail;
  }

  function getNthFromHead(uint256 position) public view returns (SllNode) {
    if (!isContract(address(head))) {
      revert EmptyList();
    }
    SllNode current = head;
    for (uint256 i = 0; i < position; i++) {
      if (!isContract(address(current))) {
        revert Overflow(i);
      }
      current = current.getNext();
    }
    return current;
  }

  function reverse() public {
    if (!isContract(address(head))) {
      revert EmptyList();
    }
    SllNode prev = SllNode(address(0));
    SllNode current = head;
    while (isContract(address(current))) {
      SllNode next = current.getNext();
      current.setNext(prev);
      prev = current;
      current = next;
    }
    head = prev;
  }

  function reverseRecursive() public {
    if (!isContract(address(head))) {
      revert EmptyList();
    }
    head = reverseRecursive(head);
  }

  function reverseRecursive(SllNode current) private returns (SllNode) {
    SllNode next = current.getNext();
    if (isContract(address(next))) {
      SllNode tail = reverseRecursive(next);
      next.setNext(current);
      return tail;
    } else {
      return current;
    }
  }
}

/// @title Single Linked List node
/// @author Utku Sarioglu
/// @notice Acts as a node of a singly linked list
/// @dev This would be an expensive approach to building a linked list
contract SllNode {
  bytes32 private data = bytes32(0);
  SllNode private next;

  constructor(bytes32 initialData) {
    data = initialData;
  }

  function setData(bytes32 newData) public {
    data = newData;
  }

  function getData() public view returns (bytes32) {
    return data;
  }

  function getNext() public view returns (SllNode) {
    return next;
  }

  function setNext(SllNode nextSllNode) public {
    next = nextSllNode;
  }
}
