#!/bin/bash

source /opt/venv/mythril/bin/activate
source ${0%/*}/analysis-common.sh
scripts/solc-select-install.sh

ANALYSIS_LOG_SUFFIX="mythril.log"
TEMP_SOLC_JSON_PATH="/tmp/solc-settings.json"
PREPROCESSED_CONTRACTS_PATH=/tmp/contracts

current_date=$(get_current_date_string)
sources_path=$(get_sources_path)

compile_temp_solc_json() {
  jq '.settings' solc.json > $TEMP_SOLC_JSON_PATH
}

remove_temp_solc_json() {
  rm "$TEMP_SOLC_JSON_PATH"
}

# Goes through the contracts in `src/contracts` uses `solc.json` at repo 
# root for remappings needed for `crytic-compile` to do its thing
# @dev
# mythril for some reason expects only the `settings` section of the config
# object. To retrieve this section, a temp file is created at `solc_json`
main() {
  compile_temp_solc_json
  artifacts_folder=$(create_artifacts_subfolder "mythril")
  echo "Created artifacts folder: '$artifacts_folder'…"

  preprocess_contracts $PREPROCESSED_CONTRACTS_PATH
  contract_names=$(get_contract_names $PREPROCESSED_CONTRACTS_PATH)
  echo "Found contracts: '$contract_names'"

  for contract_name in $contract_names;
  do
    echo "Analyzing '$contract_name'…"
    contract_path="$sources_path/$contract_name.sol"
    analysis_log_filename="$contract_name-$current_date.$ANALYSIS_LOG_SUFFIX"
    analysis_log_path="$artifacts_folder/$analysis_log_filename"

    myth analyze "$contract_path" --solc-json "$TEMP_SOLC_JSON_PATH" \
      | tee "$analysis_log_path"

    echo "Analysis log is available at '$analysis_log_path'"
    echo "Finished: '$contract_name'"
  done
  remove_temp_solc_json
}

main
