#!/bin/bash

# gets used solidity version from hardhat.config.ts, installs and enables it for crytic-compile
SOLC_VERSION=$(perl -ne 'print $1 while /solidity: "(.*)"/g' hardhat.config.ts)
echo "Determined `hardhat.config.ts` to be $SOLC_VERSION"
echo "Installing the same version for python tools..."
solc-select install $SOLC_VERSION
solc-select use $SOLC_VERSION
