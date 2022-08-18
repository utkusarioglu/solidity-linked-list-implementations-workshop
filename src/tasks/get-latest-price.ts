import { task } from "hardhat/config";
import type { ethers as Ethers } from "ethers";
import config from "config";
// @ts-ignore
import type { ChainlinkConsumer as IChainlinkConsumer } from "_typechain/ChainlinkConsumer";
// @ts-ignore
import AChainlinkConsumer from "_deployments/localhost/ChainlinkConsumer.json";

class ChainlinkConsumer {
  private ethers: typeof Ethers;
  private instance: IChainlinkConsumer;
  private wallet: Ethers.Wallet;
  private provider: Ethers.providers.JsonRpcProvider;

  constructor(ethers: typeof Ethers) {
    this.ethers = ethers;
    this.provider = new this.ethers.providers.JsonRpcProvider(
      "http://localhost:8545"
    );
    const deployerPk = config.get<string>("accounts.local.deployer.privateKey");
    this.wallet = new this.ethers.Wallet(deployerPk, this.provider);
    this.instance = new this.ethers.Contract(
      AChainlinkConsumer.address,
      AChainlinkConsumer.abi,
      this.wallet
    ) as IChainlinkConsumer;
  }

  public getLatestPrice() {
    return this.instance.getLatestPrice();
  }
}

task(
  "get-latest-price",
  "Returns the latest eth price from ChainlinkConsumer",
  async (_, { ethers }) =>
    new ChainlinkConsumer(ethers)
      .getLatestPrice()
      .then((response) => console.log(response.toString()))
);
