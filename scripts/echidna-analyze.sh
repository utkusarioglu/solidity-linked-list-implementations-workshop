#!/bin/bash

source /opt/venv/slither/bin/activate

ANALYSIS_FOLDER=./artifacts/echidna
CONTRACTS="Main"

mkdir -p $ANALYSIS_FOLDER

for SRC_CONTRACT in $CONTRACTS
do
  FUZZ_CONTRACT_NAME="${SRC_CONTRACT}Fuzz"
  FUZZ_CONTRACT_FILE="${SRC_CONTRACT}.fuzz.test.sol"
  FUZZ_CONTRACT_PATH="tests/${FUZZ_CONTRACT_FILE}"
  ANALYSIS_PATH="${ANALYSIS_FOLDER}/${SRC_CONTRACT}.analysis.txt"

  if [ ! -f "$FUZZ_CONTRACT_PATH" ];
  then
    echo "$FUZZ_CONTRACT_PATH is not available, skipping"
    continue 
  fi

  echo "Testing: $FUZZ_CONTRACT_FILE"

  echidna-test \
    "$FUZZ_CONTRACT_PATH" \
    --contract "$FUZZ_CONTRACT_NAME" \
    --config echidna.config.yml \
    --test-mode property \
    > "$ANALYSIS_PATH"

  echo "Complete: $FUZZ_CONTRACT_FILE"
done
