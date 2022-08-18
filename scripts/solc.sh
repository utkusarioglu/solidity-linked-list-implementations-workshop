#!/bin/bash

BIN_PATH=artifacts/solc
CONTRACT_FILE="Sll.sol"
CONTRACT_NAME="Sll"

mkdir -p $BIN_PATH
solc \
  --standard-json solc.json \
  --allow-paths $(pwd) | \
  jq -r '.contracts["'$CONTRACT_FILE'"].'$CONTRACT_NAME'.evm.bytecode.object' \
  > "$BIN_PATH/$CONTRACT_NAME.bin"
