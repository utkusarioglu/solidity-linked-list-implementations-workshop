import { abi } from "_artifacts/src/contracts/SllAsContracts.sol/SllNode.json";
import { beforeEachFacade, expect, testAccounts } from "_services/test.service";
import { ethers } from "hardhat";
import { type SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  type SllAsContracts,
  type SllNode,
} from "_typechain/SllAsContracts.sol";
import { asEvmObject } from "_services/test.service";

const CONTRACT_NAME = "SllAsContracts";

/**
 * Creates multiple nodes and returns their expected values
 */
async function createNodes(instance: SllAsContracts, nodeCount: number) {
  const nodes = Promise.all(
    Array(nodeCount)
      .fill(null)
      .map(async (_, i) => {
        try {
          const value = ethers.utils.formatBytes32String(i.toString());
          // const next = ethers.BigNumber.from(i === nodeCount - 1 ? -1 : i + 1);
          const receipt = await (await instance.addNode(value)).wait();
          return {
            expected: asEvmObject({ value }).struct,
            receipt,
          };
        } catch (e) {
          console.error("Error while creating node:", e);
          process.exit(1);
        }
      })
  );
  return nodes;
}

describe(CONTRACT_NAME, () => {
  testAccounts.forEach(({ index, describeMessage }) => {
    let instance: SllAsContracts;
    let signer: SignerWithAddress;

    describe(describeMessage, () => {
      beforeEach(async () => {
        const common = await beforeEachFacade<SllAsContracts>(
          CONTRACT_NAME,
          [],
          index
        );
        instance = common.signerInstance;
        signer = common.signer;
      });

      describe("getHead", () => {
        it("Returns 0 address if there is no head", async () => {
          const response = await instance.getHead();
          const expected = ethers.constants.AddressZero;
          expect(expected).to.equal(response);
        });

        it("returns address", async () => {
          const head = await instance.getHead();
          expect(ethers.utils.isAddress(head)).to.be.true;
        });

        it("Refers to a node contract", async () => {
          const nodes = await createNodes(instance, 1);
          const head = await instance.getHead();
          const one = new ethers.Contract(head, abi, signer) as SllNode;
          const data = await one.getData();
          const expected = nodes[0]?.expected["value"];
          expect(data).to.equal(expected);
        });
      });

      describe("addNode", () => {
        it("Uses the first addition as head", async () => {
          const _nodes = await createNodes(instance, 1);
          const response = await instance.getHead();
          const notExpected = ethers.constants.AddressZero;
          expect(response).to.not.equal(notExpected);
        });

        it("Emits `AddNode` when as expected", async () => {
          const data = ethers.utils.formatBytes32String("1");
          return expect(instance.addNode(data))
            .to.emit(instance, "AddSllNode")
            .withArgs(await instance.getHead(), data, true);
        });
      });

      describe("getLength", () => {
        it("Returns 0 on empty list", async () => {
          const expected = ethers.BigNumber.from(0);
          expect(await instance.getLength()).to.equal(expected);
        });

        it("Returns 1 with only head", async () => {
          await createNodes(instance, 1);
          const expected = ethers.BigNumber.from(1);
          expect(await instance.getLength()).to.equal(expected);
        });

        it("Returns 2 with head + one extra", async () => {
          const count = 2;
          await createNodes(instance, count);
          const expected = ethers.BigNumber.from(count);
          expect(await instance.getLength()).to.equal(expected);
        });

        it("Returns correct count for arbitrary values", async () => {
          const count = 10;
          await createNodes(instance, count);
          const expected = ethers.BigNumber.from(count);
          expect(await instance.getLength()).to.equal(expected);
        });
      });

      describe("getTail", () => {
        it("Reverts when there is no node", async () => {
          return expect(instance.getTail()).to.be.revertedWith("EmptyList");
        });

        it("Returns head when there is only one node", async () => {
          await createNodes(instance, 1);
          const headAddress = await instance.getHead();
          expect(await instance.getTail()).to.be.equal(headAddress);
        });

        it("Returns 2nd when there are 2 nodes", async () => {
          await createNodes(instance, 2);
          const headAddress = await instance.getHead();
          const head = new ethers.Contract(headAddress, abi, signer) as SllNode;
          const secondAddress = await head.getNext();
          expect(await instance.getTail()).to.equal(secondAddress);
        });
      });

      describe("getNthFromHead", () => {
        it("Reverts for an empty head", async () => {
          return expect(instance.getNthFromHead(0)).to.be.revertedWith(
            "EmptyList"
          );
        });

        it("Reverts for a non-existent node", async () => {
          await createNodes(instance, 1);
          return expect(instance.getNthFromHead(2)).to.be.revertedWith(
            "Overflow"
          );
        });

        it("Returns head on a non-empty list", async () => {
          await createNodes(instance, 3);
          const head = await instance.getHead();
          expect(await instance.getNthFromHead(0)).to.equal(head);
        });

        Array(10)
          .fill(null)
          .forEach((_, i) => {
            it(`Returns node number ${i} as expected`, async () => {
              const nodes = await createNodes(instance, 10);
              const sllNodeAddress = await instance.getNthFromHead(i);
              const sllNode = new ethers.Contract(
                sllNodeAddress,
                abi,
                signer
              ) as SllNode;
              const sllNodeData = await sllNode.getData();
              // const expected = ethers.BigNumber.from(i);
              const expected = nodes[i]?.expected["value"];
              expect(sllNodeData).to.equal(expected);
            });
          });
      });

      describe("reverse", () => {
        it("Reverts on empty list", async () => {
          expect(instance.reverse()).to.be.revertedWith("EmptyList");
        });

        it("Returns head when there is single node", async () => {
          await createNodes(instance, 1);
          const initialHead = await instance.getHead();
          await instance.reverse();
          const finalHead = await instance.getHead();
          expect(initialHead).to.equal(finalHead);
        });

        it("Reverts multiple node list as expected", async () => {
          type GetAddresses = (chainLength: number) => Promise<string[]>;
          const getAddresses: GetAddresses = (chainLength) => {
            return Promise.all(
              Array(chainLength)
                .fill(null)
                .map(async (_, i) => {
                  return await instance.getNthFromHead(i);
                })
            );
          };
          const chainLength = 10;
          await createNodes(instance, chainLength);
          const initialAddresses = await getAddresses(chainLength);
          await instance.reverse();
          const finalAddresses = await getAddresses(chainLength);
          expect(initialAddresses.reverse()).to.deep.eq(finalAddresses);
        });
      });

      describe("reverseRecursive", () => {
        it("Reverts on empty list", async () => {
          expect(instance.reverseRecursive()).to.be.revertedWith("EmptyList");
        });

        it("Returns head when there is single node", async () => {
          await createNodes(instance, 1);
          const initialHead = await instance.getHead();
          await instance.reverseRecursive();
          const finalHead = await instance.getHead();
          expect(initialHead).to.equal(finalHead);
        });

        it("Reverts multiple node list as expected", async () => {
          type GetAddresses = (chainLength: number) => Promise<string[]>;
          const getAddresses: GetAddresses = (chainLength) => {
            return Promise.all(
              Array(chainLength)
                .fill(null)
                .map(async (_, i) => {
                  return await instance.getNthFromHead(i);
                })
            );
          };
          const chainLength = 10;
          await createNodes(instance, chainLength);
          const initialAddresses = await getAddresses(chainLength);
          await instance.reverseRecursive();
          const finalAddresses = await getAddresses(chainLength);
          expect(initialAddresses.reverse()).to.deep.eq(finalAddresses);
        });
      });
    });
  });
});
