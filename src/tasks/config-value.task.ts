import { task } from "hardhat/config";

task("config-value", "returns values from hardhat config")
  .addPositionalParam("requestedConfig", "config value to find")
  .setAction(async ({ requestedConfig }, { config }) => {
    switch (requestedConfig) {
      case "solidity-version":
        const compiler = config.solidity.compilers[0];
        if (!compiler) {
          process.exit(1);
        }
        return console.log(compiler.version);

      case "sources-path":
        return console.log(config.paths.sources);

      case "tests-path":
        return console.log(config.paths.tests);
    }
  });
