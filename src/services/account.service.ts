import config from "config";
import type { ConfigAccounts } from "_types/config";

export function hardhatAccounts() {
  return Object.values(config.get<ConfigAccounts>("accounts.local")).map(
    ({ balance, privateKey }) => ({ balance, privateKey })
  );
}

export function gethAccounts() {
  return Object.values(config.get<ConfigAccounts>("accounts.local")).map(
    ({ privateKey }) => privateKey
  );
}

export function goerliAccounts() {
  return Object.values(config.get<ConfigAccounts>("accounts.goerli")).map(
    ({ privateKey }) => `0x${privateKey}`
  );
}

export function mumbaiAccounts() {
  return Object.values(config.get<ConfigAccounts>("accounts.goerli")).map(
    ({ privateKey }) => `0x${privateKey}`
  );
}

export function namedAccounts() {
  return {
    deployer: {
      hardhat: config.get<string>("accounts.local.deployer.address"),
      geth1: config.get<string>("accounts.local.deployer.address"),
      geth2: config.get<string>("accounts.local.deployer.address"),
      goerli: config.get<string>("accounts.goerli.deployer.address"),
      mumbai: config.get<string>("accounts.goerli.deployer.address"),
    },
    user1: {
      hardhat: config.get<string>("accounts.local.user1.address"),
      geth1: config.get<string>("accounts.local.user1.address"),
      geth2: config.get<string>("accounts.local.user1.address"),
    },
    user2: {
      hardhat: config.get<string>("accounts.local.user2.address"),
      geth1: config.get<string>("accounts.local.user2.address"),
      geth2: config.get<string>("accounts.local.user2.address"),
    },
    user3: {
      hardhat: config.get<string>("accounts.local.user3.address"),
      geth1: config.get<string>("accounts.local.user3.address"),
      geth2: config.get<string>("accounts.local.user3.address"),
    },
  };
}
