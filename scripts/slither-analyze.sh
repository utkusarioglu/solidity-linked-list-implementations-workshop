#!/bin/bash

source /opt/venv/slither/bin/activate

# Checks all the files in the contracts directory
# Note that`slither` relies on `slither.config.json` 
# at project root. 
for contract in src/contracts/*; 
do 
  slither $contract; 
done
