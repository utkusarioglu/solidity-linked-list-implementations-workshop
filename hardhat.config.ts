require("dotenv").config();
import { type HardhatUserConfig } from "hardhat/types";
import "tsconfig-paths/register";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-spdx-license-identifier";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "_tasks/account-balances.task";
import "_tasks/named-accounts.task";
import "_tasks/config-value.task";
import "hardhat-storage-layout";
// import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import "@typechain/hardhat";
import "@typechain/ethers-v5";
import "hardhat-tracer";
import { removeConsoleLog } from "hardhat-preprocessor";
import config from "config";
import {
  gethAccounts,
  goerliAccounts,
  hardhatAccounts,
  mumbaiAccounts,
  namedAccounts,
} from "_services/account.service";

const hardhatConfig: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  paths: {
    sources: "src/contracts",
    tests: "tests",
    cache: "artifacts/cache",
    artifacts: "artifacts/hardhat",
    imports: "artifacts/imports",
    deployments: "artifacts/deployments",
    deploy: "src/deployers",
    newStorageLayoutPath: "artifacts/storage-layout",
  },
  solidity: {
    version: "0.8.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      saveDeployments: true,
      accounts: hardhatAccounts(),
      tags: ["local"],
      forking: {
        enabled: config.get<boolean>("features.forking"),
        url: `https://polygon-mumbai.g.alchemy.com/v2/${config.get(
          "apiKeys.alchemy.polygon.mumbai"
        )}`,
      },
    },

    geth1: {
      url: config.get<string>("geth.instance1"),
      chainId: 8545,
      accounts: gethAccounts(),
      tags: ["local"],
    },

    geth2: {
      url: config.get<string>("geth.instance2"),
      chainId: 9545,
      accounts: gethAccounts(),
      tags: ["local"],
    },

    ...(config.has("accounts.goerli") && {
      goerli: {
        url: `https://goerli.infura.io/v3/${config.get<string>(
          "apiKeys.infura"
        )}`,
        accounts: goerliAccounts(),
      },

      mumbai: {
        url: `https://polygon-mumbai.g.alchemy.com/v2/${config.get<string>(
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
  preprocess: {
    eachLine: removeConsoleLog(
      (hre) => !["localhost", "hardhat"].includes(hre.network.name)
    ),
  },

  ...(config.has("apiKeys.etherscan") && {
    etherscan: {
      apiKey: config.get<string>("apiKeys.etherscan"),
    },
  }),

  ...(config.has("apiKeys.coinMarketCap") && {
    gasReporter: {
      token: config.get<string>("features.gasReporter.token"),
      enabled: config.get<boolean>("features.gasReporter.enabled"),
      coinmarketcap: config.get<string>("apiKeys.coinMarketCap"),
      currency: "USD",
    },
  }),
};

export default hardhatConfig;
