#!/bin/bash

source /opt/venv/slither/bin/activate
source ${0%/*}/analysis-common.sh
scripts/solc-select-install.sh

FUZZ_CONTRACT_SUFFIX="fuzz.test.sol"
ANALYSIS_LOG_SUFFIX="echidna.log"

tests_path=$(get_tests_path)
sources_path=$(get_sources_path)
current_date=$(get_current_date_string)

main() {
  artifacts_folder=$(create_artifacts_subfolder "echidna")
  echo "Created artifacts folder: '$artifacts_folder'…"

  sources_path=$(get_sources_path)
  contract_names=$(get_contract_names $sources_path)
  echo "Found contracts: '$contract_names'"

  for contract_name in $contract_names
  do
    source_contract_path="$sources_path/$contract_name.sol"
    fuzz_contract_name="${contract_name}Fuzz"
    fuzz_contract_file="$contract_name.$FUZZ_CONTRACT_SUFFIX"
    fuzz_contract_path="$tests_path/$fuzz_contract_file"
    analysis_log_filename="$contract_name-$current_date.$ANALYSIS_LOG_SUFFIX"
    analysis_log_path="$artifacts_folder/$analysis_log_filename"

    if [ ! -f "$fuzz_contract_path" ];
    then
      echo "$fuzz_contract_path is not available, skipping"
      continue 
    fi

    echo "Testing: '$fuzz_contract_file'…"
    echidna-test \
      "$fuzz_contract_path" \
      --contract "$fuzz_contract_name" \
      --config echidna.config.yml \
      --test-mode property \
      | tee "$analysis_log_path"

    echo "Analysis log is available at '$analysis_log_path'"
    echo "Finished: $fuzz_contract_file."
  done
}

main
