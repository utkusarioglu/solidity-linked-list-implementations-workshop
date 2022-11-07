#!/bin/bash

source ${0%/*}/checks.sh
source ${0%/*}/check-template-updates.sh

check_repo_update_type
check_repo_template_updates
check_parent_template_updates

git fetch origin
echo
git status

echo
display_repo_template_updates
display_parent_template_updates
