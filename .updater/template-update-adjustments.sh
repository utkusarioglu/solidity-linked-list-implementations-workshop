#!/bin/bash

source ${0%/*}/checks.sh
check_repo_config
source ${0%/*}/utils.sh

git_origin_update() {
  record_target=$1
  template_repo_url=$2
  if [ ! -f $record_target ];
  then
    touch $record_target
  else
    sed -i '/TEMPLATE_REPO_URL/d' $record_target 
  fi
  echo "TEMPLATE_REPO_URL=$template_repo_url" >> $record_target
}

template_repo_url=$1
repo_class=$2
repo_service=$3
repo_path=$4
record_target=$5
template_auto_reject=$6

do_adjustments() {
  phrase=$1
  replacement=$2
  current=$(cat .devcontainer/devcontainer.json | jq -r ".$phrase")
  if [ $? != 0 ]; then
    echo "Warn: Skipping '$phrase' as something went wrong."
    continue
  fi
  echo "Replacing '$current' with '$replacement'…"
  find . -type f \( ! -iwholename "./${0%/*}/setup.sh" ! -iname ".git" \) \
    -exec sed -i "s:$current:$replacement:g" {} \;
}

echo "Starting template adjustments…"
do_adjustments name $repo_class
do_adjustments workspaceFolder $repo_path
do_adjustments service $repo_service

git_template_repo_url_update $record_target $template_repo_url

if [ ! -z "$template_auto_reject" ]; then
  echo "Auto-rejections found: '$template_auto_reject'"
  for rejection in $template_auto_reject; do
    echo "Rejecting: '$rejection'…"
    git restore "$rejection" 1> /dev/null
    git clean -f "$rejection"
  done
fi
