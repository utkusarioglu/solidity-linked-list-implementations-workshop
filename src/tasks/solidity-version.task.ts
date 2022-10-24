import { task } from "hardhat/config";

task(
  "solidity-version",
  "Displays the solidity version selection in hardhat config",
  async (_, hre) => {
    const compiler = hre.config.solidity.compilers[0];
    if (!compiler) {
      console.log("none");
      return;
    }
    console.log(compiler.version);
  }
);
