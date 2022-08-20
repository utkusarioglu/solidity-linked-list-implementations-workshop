console.log("hardhat.config.cwd", process.cwd());
require("dotenv").config();
import "tsconfig-paths/register";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-spdx-license-identifier";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "_tasks/account-balances";
import "_tasks/named-accounts";
import "hardhat-storage-layout";
// import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import "@typechain/hardhat";
import "@typechain/ethers-v5";
import "hardhat-tracer";
import config from "config";
import {
  gethAccounts,
  goerliAccounts,
  hardhatAccounts,
  mumbaiAccounts,
  namedAccounts,
} from "_services/account.service";

const hardhatConfig = {
  solidity: "0.8.7",
  defaultNetwork: "hardhat",
  paths: {
    sources: "./src/contracts",
    tests: "tests",
    cache: "artifacts/cache",
    artifacts: "artifacts/hardhat",
    imports: "artifacts/imports",
    deployments: "deployments",
    deploy: "artifacts/deploy",
    newStorageLayoutPath: "artifacts/storage-layout",
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },

  networks: {
    hardhat: {
      saveDeployments: true,
      accounts: hardhatAccounts(),
      tags: ["local"],
      // forking: {
      //   enabled: true,
      //   url: `https://polygon-mumbai.g.alchemy.com/v2/${config.get(
      //     "apiKeys.alchemy.polygon.mumbai"
      //   )}`,
      // },
    },

    geth1: {
      url: config.get("geth.instance1"),
      chainId: 8545,
      accounts: gethAccounts(),
      tags: ["local"],
    },

    geth2: {
      url: config.get("geth.instance2"),
      chainId: 9545,
      accounts: gethAccounts(),
      tags: ["local"],
    },

    ...(config.has("accounts.goerli") && {
      goerli: {
        url: `https://goerli.infura.io/v3/${config.get("apiKeys.infura")}`,
        accounts: goerliAccounts(),
      },

      mumbai: {
        url: `https://polygon-mumbai.g.alchemy.com/v2/${config.get(
          "apiKeys.alchemy"
        )}`,
        accounts: mumbaiAccounts(),
      },
    }),
  },

  namedAccounts: namedAccounts(),

  typechain: {
    outDir: "./artifacts/typechain",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
  etherscan: {
    apiKey: config.get("apiKeys.etherscan"),
  },

  ...(config.has("apiKeys.coinMarketCap") && {
    gasReporter: {
      token: config.get<string>("features.gasReporter.token"),
      enabled: config.get<boolean>("features.gasReporter.enabled"),
      coinmarketcap: config.get("apiKeys.coinMarketCap"),
      currency: "USD",
    },
  }),
};

export default hardhatConfig;
