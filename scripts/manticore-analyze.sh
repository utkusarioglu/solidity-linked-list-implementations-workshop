#!/bin/bash

source /opt/venv/manticore/bin/activate
source ${0%/*}/analysis-common.sh
scripts/solc-select-install.sh

TEMP_SOLC_JSON_PATH="/tmp/solc-settings.json"
ANALYSIS_LOG_SUFFIX="manticore.log"
TIMEOUT_PER_CONTRACT=$(( 1 * 60 * 60 )) # 1 hour

sources_path=$(get_sources_path)
current_date=$(get_current_date_string)

get_solc_remaps() {
  jq -r '.settings.remappings | join(" ")' solc.json
}

# Goes through the contracts in `src/contracts` uses `solc.json` at repo 
# root for remappings needed for `crytic-compile` to do its thing
main() {
  artifacts_folder=$(create_artifacts_subfolder "manticore")
  echo "Created artifacts folder: '$artifacts_folder'…"

  contract_names=$(get_contract_names)
  echo "Found contracts: '$contract_names'"

  solc_remaps=$(get_solc_remaps)
  echo "solc remaps: $solc_remaps"
  for contract_name in $contract_names;
  do
    echo "Testing: '$contract_name'…"
    source_contract_path="$sources_path/$contract_name.sol"
    analysis_log_filename="$contract_name-$current_date.$ANALYSIS_LOG_SUFFIX"
    analysis_log_path="$artifacts_folder/$analysis_log_filename"
    mcore_workspace="$artifacts_folder/$current_date"

    manticore \
      --hardhat-cache-directory "$(pwd)/artifacts/cache" \
      --hardhat-artifacts-directory "$(pwd)/artifacts/hardhat" \
      --solc-remaps "$solc_remaps" \
      --contract "$contract_name" \
      --workspace "$mcore_workspace" \
      --timeout "$TIMEOUT_PER_CONTRACT" \
      "$source_contract_path" \
      | tee "$analysis_log_path"

    echo "Analysis log is available at '$analysis_log_path'"
    echo "Finished: '$contract_name'"
  done
}

main
