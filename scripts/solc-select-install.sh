#!/bin/bash

# gets used solidity version from hardhat.config.ts, installs and enables it for crytic-compile
SOLC_VERSION=$(yarn -s hardhat config-value solidity-version)
if [ "$SOLC_VERSION" == "none" ]; then
  echo "Error: Hardhat config 'solidity.version' needs to be set"
  exit 1
fi
echo "Determined 'hardhat.config.ts' to use solidity version $SOLC_VERSION."
echo "Installing the same version for python tools..."
solc-select install $SOLC_VERSION
solc-select use $SOLC_VERSION
