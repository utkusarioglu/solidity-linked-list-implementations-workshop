#!/bin/bash

root="${0%/*}/.."

for subpath in node_modules artifacts crytic-export *.log;
do
  rm -rf "$root/$subpath"
done
