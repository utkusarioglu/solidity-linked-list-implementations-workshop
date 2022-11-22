#!/bin/bash

source /opt/venv/slither/bin/activate
source ${0%/*}/analysis-common.sh
scripts/solc-select-install.sh

ANALYSIS_LOG_SUFFIX="slither.log"
PREPROCESSED_CONTRACTS_PATH=/tmp/contracts

current_date=$(get_current_date_string)
sources_path=$(get_sources_path)

create_artifacts_folder() {
  echo "Creating analysis artifacts folder: '$ANALYSIS_ARTIFACTS_FOLDER'…"
  mkdir -p "$ANALYSIS_ARTIFACTS_FOLDER"
}

# Note that`slither` relies on `slither.config.json` 
# at project root. 
main() {
  artifacts_folder=$(create_artifacts_subfolder "slither")
  echo "Created artifacts folder: '$artifacts_folder'…"

  preprocess_contracts $PREPROCESSED_CONTRACTS_PATH
  contract_names=$(get_contract_names $PREPROCESSED_CONTRACTS_PATH)
  echo "Found contracts: '$contract_names'"

  for contract_name in $contract_names;
  do 
    echo "Testing: '$contract_name'…"
    source_contract_path="$sources_path/$contract_name.sol"
    analysis_log_filename="$contract_name-$current_date.$ANALYSIS_LOG_SUFFIX"
    analysis_log_path="$artifacts_folder/$analysis_log_filename"

    slither "$source_contract_path" | tee "$analysis_log_path"

    echo "Analysis log is available at '$analysis_log_path'"
    echo "Finished: '$contract_name'"
  done
}

main
