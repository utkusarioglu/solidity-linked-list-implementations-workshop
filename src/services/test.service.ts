import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, run } from "hardhat";
import { use, expect as chaiExpect } from "chai";
import { solidity } from "ethereum-waffle";
import config from "config";
import type { ConfigAccount, ConfigAccounts } from "../types/config";
import type { Contract } from "ethers";

use(solidity);

export const expect = chaiExpect;

/**
 * Uses ether's getSigner function to return the signer at the index
 * requested. This function is created to declutter the test environment.
 * @param signerIndex index of the desired signer
 * @returns SignerWithAddress object managed by ethers
 * @throws when a signer is not available at the requested index
 */
export async function getSigner(
  signerIndex: number
): Promise<SignerWithAddress> {
  const signers = await ethers.getSigners();
  const signer = signers[signerIndex];
  if (!signer) {
    throw new Error(
      `Tests require signer "${signerIndex}", which is not available.`
    );
  }
  return signer;
}

/**
 * Tries to help with ether-js returns for solidity structs.
 * Solidity structs are returned as custom arrays; with values both attached
 * as indexed and keyed values.
 *
 * @dev HACK TODO
 * While creating an array with custom props is
 * straightforward, creating the types for these arrays from an object is not.
 * So, the types for this function leave a lot to be desired.
 *
 * TS's handling of Object to tuple conversion is very lacking. Even the best
 * solutions do not guarantee the ordering of the tuple items. And, this is
 * simply not good enough to use here.
 *
 * This function does its job but variable and generic naming, types (as covered
 * before) and even this documentation will need to be seriously rewritten.
 * @param obj js object with sol struct keys and values.
 * @returns a tuple with an array and a solc struct array
 */
export function asEvmObject<G extends [Record<string, unknown>, unknown[]]>(
  obj: G[0]
): {
  struct: G[0] & G[1];
  tuple: G[1];
} {
  const tuple = Object.values(obj) as unknown as G[1];
  const struct = [...tuple] as G[1];
  Object.entries(obj).forEach(([key, value]) => {
    // @ts-ignore
    struct[key] = value;
  });
  // @ts-ignore
  return { struct, tuple };
}

/**
 * An array of account information gathered from
 * `config` library data. Every entry also includes the index and the
 * complete list of accounts, this is useful for creating pairings for
 * tests.
 */
export const localAccounts = Object.entries(
  config.get<ConfigAccounts>("accounts.local")
).map(([name, values], index, list) => ({
  index,
  name,
  describeMessage: `As "${name}" at ${values.address} (${index})`,
  ...values,
  list: list.map(([_, account]) => account),
}));

/**
 * Chooses either the deployer account or all accounts depending on
 * the setting of the `features.multiUserTesting` config value.
 */
export const testAccounts = config.get<boolean>("features.multiUserTesting")
  ? localAccounts
  : localAccounts.slice(0, 1);

/**
 * Handles common test preparation tasks such as creating a signer
 * and a contract. Especially useful if the tests are run for each
 * signer.
 * @param contractName name of the contract. This is used in
 * `ethers.getContractFactory`
 * @param index index of the signer for which to set up the signer and
 * signerInstance objects
 * @returns deployer, signer and their contract instances
 */
export async function beforeEachFacade<C extends Contract>(
  contractName: string,
  args: any[],
  index: number
) {
  await run("compile", { quiet: true, noTypechain: true });
  const deployer = await getSigner(0);
  const signer = await getSigner(index);
  const contract = await ethers.getContractFactory(contractName, deployer);
  const deployerInstance = (await contract.deploy(...args)) as C;
  await deployerInstance.deployed();
  const signerInstance = deployerInstance.connect(signer) as C;
  return {
    deployer,
    signer,
    deployerInstance,
    signerInstance,
  };
}
