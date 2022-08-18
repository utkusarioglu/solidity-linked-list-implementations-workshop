#!/bin/bash

source /opt/venv/slither/bin/activate

# Goes through the contracts in `src/contracts` uses `solc.json` at repo 
# root for remappings needed for `crytic-compile` to do its thing
main() {
  # TEMP_JSON=/tmp/solc-settings.json
  # jq '.settings.remappings ' solc.json > $TEMP_JSON
  TEMP_JSON=$(jq '.settings.remappings | join(",")' solc.json)
  for contract in src/contracts/*;
  do
    echo "Analyzing \"$contract\"..."
    echo "$TEMP_JSON"
    # manticore --solc-remaps=$TEMP_JSON $contract 
    manticore --solc-standard-json solc.json $contract
  done
  # rm $TEMP_JSON
  # mkdir -p artifacts/manticore
  # mv mcore_* artifacts/manticore/
}

main
