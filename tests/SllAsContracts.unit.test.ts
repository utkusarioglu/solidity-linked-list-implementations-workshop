import { abi } from "_artifacts/src/contracts/SllAsContracts.sol/SllNode.json";
import { beforeEachFacade, expect, testAccounts } from "_services/test.service";
import { ethers } from "hardhat";
import { type SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  type SllAsContracts,
  type SllNode,
} from "_typechain/SllAsContracts.sol";

const CONTRACT_NAME = "SllAsContracts";

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
        it("returns address", async () => {
          const head = await instance.getHead();
          expect(ethers.utils.isAddress(head)).to.be.true;
        });

        it("Refers to a node contract", async () => {
          await instance.createNodes(1);
          const head = await instance.getHead();
          const one = new ethers.Contract(head, abi, signer) as SllNode;
          const data = await one.getData();
          const expected = ethers.BigNumber.from(0);
          expect(data).to.equal(expected);
        });
      });

      describe("createNodes", () => {
        it("Handles 0", async () => {
          return expect(instance.createNodes(0)).to.not.emit(
            instance,
            "AddSllNode"
          );
        });

        it("Handles 1", async () => {
          return expect(instance.createNodes(1)).to.emit(
            instance,
            "AddSllNode"
          );
        });

        it("Handles head being created twice", async () => {
          await expect(instance.createNodes(1)).to.emit(instance, "AddSllNode");
          return expect(instance.createNodes(1)).to.not.emit(
            instance,
            "AddSllNode"
          );
        });

        it("Handles creation of 2", async () => {
          return expect(instance.createNodes(2))
            .to.emit(instance, "AddSllNode")
            .to.emit(instance, "AddSllNode")
            .to.emit(instance, "AddSllNode");
        });

        /**
         * TODO there needs to be a decision on how to handle double
         * creation. Currently the contract silently ignores this
         * while this test expects double creation to be reverted.
         * Until this decision is made, this test is skipped.
         */
        it.skip("Reverts double creation", async () => {
          await instance.createNodes(2);
          return expect(instance.createNodes(2)).to.be.revertedWith(
            "ExistingList"
          );
        });
      });

      describe("getLength", () => {
        it("Returns 0 on empty list", async () => {
          const expected = ethers.BigNumber.from(0);
          expect(await instance.getLength()).to.equal(expected);
        });

        it("Returns 1 with only head", async () => {
          await instance.createNodes(1);
          const expected = ethers.BigNumber.from(1);
          expect(await instance.getLength()).to.equal(expected);
        });

        it("Returns 2 with head + one extra", async () => {
          const count = 2;
          await instance.createNodes(count);
          const expected = ethers.BigNumber.from(count);
          expect(await instance.getLength()).to.equal(expected);
        });

        it("Returns correct count for arbitrary values", async () => {
          const count = 10;
          await instance.createNodes(count);
          const expected = ethers.BigNumber.from(count);
          expect(await instance.getLength()).to.equal(expected);
        });
      });

      describe("getTail", () => {
        it("Reverts when there is no node", async () => {
          return expect(instance.getTail()).to.be.revertedWith("EmptyList");
        });

        it("Returns head when there is only one node", async () => {
          await instance.createNodes(1);
          const headAddress = await instance.getHead();
          expect(await instance.getTail()).to.be.equal(headAddress);
        });

        it("Returns 2nd when there are 2 nodes", async () => {
          await instance.createNodes(2);
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
          await instance.createNodes(1);
          return expect(instance.getNthFromHead(2)).to.be.revertedWith(
            "Overflow"
          );
        });

        it("Returns head on a non-empty list", async () => {
          await instance.createNodes(3);
          const head = await instance.getHead();
          expect(await instance.getNthFromHead(0)).to.equal(head);
        });

        Array(10)
          .fill(null)
          .forEach((_, i) => {
            it(`Returns node number ${i} as expected`, async () => {
              await instance.createNodes(10);
              const sllNodeAddress = await instance.getNthFromHead(i);
              const sllNode = new ethers.Contract(
                sllNodeAddress,
                abi,
                signer
              ) as SllNode;
              const sllNodeData = await sllNode.getData();
              const expected = ethers.BigNumber.from(i);
              expect(sllNodeData).to.equal(expected);
            });
          });
      });

      describe("reverse", () => {
        it("Reverts on empty list", async () => {
          expect(instance.reverse()).to.be.revertedWith("EmptyList");
        });

        it("Returns head when there is single node", async () => {
          await instance.createNodes(1);
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
          await instance.createNodes(chainLength);
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
          await instance.createNodes(1);
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
          await instance.createNodes(chainLength);
          const initialAddresses = await getAddresses(chainLength);
          await instance.reverseRecursive();
          const finalAddresses = await getAddresses(chainLength);
          expect(initialAddresses.reverse()).to.deep.eq(finalAddresses);
        });
      });
    });
  });
});
