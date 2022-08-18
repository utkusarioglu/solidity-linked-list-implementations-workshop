#!/bin/bash

source /opt/venv/mythril/bin/activate

# Goes through the contracts in `src/contracts` uses `solc.json` at repo 
# root for remappings needed for `crytic-compile` to do its thing
# @dev
# mythril for some reason expects only the `settings` section of the config
# object. To retrieve this section, a temp file is created at `TEMP_JSON`
main() {
  TEMP_JSON=/tmp/solc-settings.json
  jq '.settings' solc.json > $TEMP_JSON
  for contract in src/contracts/*;
  do
    echo "Analyzing \"$contract\"..."
    myth analyze $contract --solc-json $TEMP_JSON
  done
  rm $TEMP_JSON
}

main
