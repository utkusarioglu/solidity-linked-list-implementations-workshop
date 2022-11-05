import {
  asEvmObject,
  beforeEachFacade,
  expect,
  testAccounts,
} from "_services/test.service";
import { ethers } from "hardhat";
import { type SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  type SllNodeStructOutput,
  type SllAsStructs,
} from "_typechain/SllAsStructs";

const CONTRACT_NAME = "SllAsStructs";

async function getChain(instance: SllAsStructs, nodeCount: number) {
  return Promise.all(
    Array(nodeCount)
      .fill(null)
      .map(async (_, i) => instance.getNthFromHead(i + 1))
  );
}

/**
 * Creates multiple nodes and returns their expected values
 */
async function createNodes(instance: SllAsStructs, nodeCount: number) {
  const nodes = Promise.all(
    Array(nodeCount)
      .fill(null)
      .map(async (_, i) => {
        try {
          const value = ethers.BigNumber.from(i + 10);
          const next = ethers.BigNumber.from(i === nodeCount - 1 ? -1 : i + 1);
          const receipt = await (await instance.addNode(value)).wait();
          return {
            expected: asEvmObject({ value, next }).struct,
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
    let instance: SllAsStructs;
    let signer: SignerWithAddress;

    describe(describeMessage, () => {
      beforeEach(async () => {
        const common = await beforeEachFacade<SllAsStructs>(
          CONTRACT_NAME,
          [],
          index
        );
        instance = common.signerInstance;
        signer = common.signer;
      });

      describe("getHead", () => {
        it("Reverts if there are no nodes", async () => {
          return expect(instance.getHead()).to.be.revertedWith("EmptyList");
        });

        [1, 10, 100].forEach((count) => {
          it(`Responds to ${count} nodes as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const response = await instance.getHead();
            const expected = nodes[0]!.expected;
            expect(response).to.deep.equal(expected);
          });
        });
      });

      describe("getTail", () => {
        it("Reverts if there are no nodes", async () => {
          await expect(instance.getTail()).to.be.revertedWith("EmptyList");
        });

        [1, 10, 100].forEach((count) => {
          it(`Responds to ${count} nodes as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const response = await instance.getTail();
            const expected = nodes[count - 1]!.expected;
            expect(response).to.deep.eq(expected);
          });
        });
      });

      describe("getChainLength", () => {
        it("Responds to 0 nodes correctly", async () => {
          const response = await instance.getChainLength();
          const expected = ethers.BigNumber.from(0);
          expect(response).to.eq(expected);
        });

        [1, 10, 100].forEach((count) => {
          it(`Responds to ${count} node(s) correctly`, async () => {
            const _nodes = await createNodes(instance, count);
            const response = await instance.getChainLength();
            const expected = ethers.BigNumber.from(count);
            expect(response).to.eq(expected);
          });
        });
      });

      describe("getHeap", () => {
        it("Returns empty array if heap is empty", async () => {
          const response = await instance.getHeap();
          const expected: SllNodeStructOutput[] = [];
          expect(response).to.deep.equal(expected);
        });

        [1, 10, 100].forEach((count) => {
          it(`Responds to ${count} nodes as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const expected = nodes.map((item) => item.expected);
            const response = await instance.getHeap();
            expect(response).to.deep.equal(expected);
          });
        });
      });

      describe("getNthFromHead", () => {
        [1, 10].forEach((count) => {
          it(`Gets first among ${count} as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const expected = nodes[0]!.expected;
            const response = await instance.getNthFromHead(0);
            expect(response).to.deep.equal(expected);
          });
        });

        [2, 10, 100].forEach((count) => {
          it(`Gets last among ${count} as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const expected = nodes[count - 1]!.expected;
            const response = await instance.getNthFromHead(count);
            expect(response).to.deep.equal(expected);
          });
        });

        [2, 10, 100].forEach((count) => {
          const index = Math.floor(count / 2);
          it(`Gets ${index} among ${count} as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const expected = nodes[index - 1]!.expected;
            const response = await instance.getNthFromHead(index);
            expect(response).to.deep.equal(expected);
          });
        });
      });

      describe("getNthPtrFromTail", () => {
        [1, 10, 100].forEach((count) => {
          it(`Returns last among ${count} as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const expected = nodes[count - 1]!.expected;
            const response = await instance.getNthFromTail(0);
            expect(response).to.deep.equal(expected);
          });
        });

        [1, 10, 100].forEach((count) => {
          it(`Returns first among ${count} as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const expected = nodes[0]!.expected;
            const response = await instance.getNthFromTail(count);
            expect(response).to.deep.equal(expected);
          });
        });

        /**
         * @dev
         * #1 Different from all other test arrays, here `ceil` is used
         * # instead of `floor`. This is because ceil leads to index `-1`
         * # being referenced when the array size is set as 1. Using `ceil`
         * # resolves this issue
         */
        [1, 10, 100].forEach((count) => {
          const index = Math.ceil(count / 2); // #1
          it(`Returns ${index} among ${count} as expected`, async () => {
            const nodes = await createNodes(instance, count);
            const expected = nodes[index - 1]!.expected;
            const response = await instance.getNthFromTail(index);
            expect(response).to.deep.equal(expected);
          });
        });
      });

      describe("reverse", () => {
        [1, 2, 3, 10].forEach((count) => {
          it(`Reverses ${count} nodes as expected`, async () => {
            const _nodes = await createNodes(instance, count);
            const before = await getChain(instance, count);
            await instance.reverse();
            const after = await getChain(instance, count);
            before.reverse().forEach(({ value: beforeValue }, i) => {
              const afterValue = after[i]!.value;
              expect(afterValue).to.deep.equal(beforeValue);
            });
          });
        });
      });

      describe("reverseRecursive", () => {
        it("Reverts with empty list", async () => {
          return expect(instance.reverseRecursive()).to.be.revertedWith(
            "EmptyList"
          );
        });

        [1, 2, 3, 10].forEach((count) => {
          it(`Reverses ${count} nodes as expected`, async () => {
            const _nodes = await createNodes(instance, count);
            const before = await getChain(instance, count);
            await instance.reverse();
            const after = await getChain(instance, count);
            before.reverse().forEach(({ value: beforeValue }, i) => {
              const afterValue = after[i]!.value;
              expect(afterValue).to.deep.equal(beforeValue);
            });
          });
        });
      });
    });
  });
});
