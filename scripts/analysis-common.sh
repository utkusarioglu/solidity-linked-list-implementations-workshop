
get_sources_path() {
  yarn -s hardhat config-value sources-path
}

get_contract_names() {
  sources_path=$1
  if [ -z "$sources_path" ]; then
    echo "Error: Function needs the first param to be the sources path"
    exit 1
  fi
  find $sources_path \
    -name '*.sol' \
    -type f \
    -exec sh -c "\
      prefix_removed=\${0#\"$sources_path/\"}; \
      suffix_removed=\${prefix_removed%\".sol\"}; \
      echo \$suffix_removed; \
    " {} \;
}

get_current_date_string() {
  date +%y%m%d-%H%M%S
}

get_tests_path() {
  yarn -s hardhat config-value tests-path
}

create_artifacts_subfolder() {
  artifacts_subfolder="$1"
  if [ -z "$artifacts_subfolder" ]; then
    exit 1
  fi
  artifacts_folder="artifacts/$artifacts_subfolder"
  mkdir -p "$artifacts_folder"
  echo "$artifacts_folder"
}

preprocess_contracts() {
  target_path=$1
  if [ -z "$target_path" ]; then 
    echo "Error: Function needs target path as the first param"
    exit 1
  fi
  mkdir -p $target_path
  yarn hardhat preprocess --network geth1 --dest "$target_path"
}

get_solc_remaps() {
  jq -r '.settings.remappings' solc.json
}

get_solc_remaps_joined() {
  jq -r '.settings.remappings | join(" ")' solc.json
}
