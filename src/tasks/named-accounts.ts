import { task } from "hardhat/config";

task(
  "named-accounts",
  "Get named accounts",
  async (_, { getNamedAccounts }) => {
    Object.entries(await getNamedAccounts()).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });
  }
);
