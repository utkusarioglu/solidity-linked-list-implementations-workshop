import { type SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { type Main } from "_typechain/Main";
import { beforeEachFacade, expect, testAccounts } from "_services/test.service";

const CONTRACT_NAME = "Main";

describe(CONTRACT_NAME, () => {
  testAccounts.forEach(({ index, describeMessage }) => {
    let instance: Main;
    let signer: SignerWithAddress;

    describe(describeMessage, () => {
      beforeEach(async () => {
        const common = await beforeEachFacade<Main>(CONTRACT_NAME, [], index);
        instance = common.signerInstance;
        signer = common.signer;
      });

      describe("constructor", () => {
        it("runs without reverting", async () => {
          expect(true).to.equal(true);
        });
      });

      describe("getGreeting", () => {
        it("Returns greeting", async () => {
          const response = await instance.getGreeting();
          const expected = "Hello World!";
          return expect(response).to.equal(expected);
        });
      });
    });
  });
});
