#!/bin/bash

# gets used solidity version from hardhat.config.ts, installs and enables it for crytic-compile
echo "Determining solc version from hardhat.config.ts..."
SOLC_VERSION=$(perl -ne 'print $1 while /solidity: "(.*)"/g' hardhat.config.ts)
solc-select install $SOLC_VERSION
solc-select use $SOLC_VERSION
