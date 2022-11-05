
get_sources_path() {
  yarn -s hardhat config-value sources-path
}

get_contract_names() {
  sources_path=$(get_sources_path)
  find $sources_path \
    -name '*.sol' \
    -type f \
    -exec sh -c "\
      prefix_removed=\${0#\"$sources_path/\"}; \
      suffix_removed=\${prefix_removed%\".sol\"}; \
      echo \$suffix_removed; \
    " {} \;
}

get_sources_path() {
  yarn -s hardhat config-value sources-path
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
