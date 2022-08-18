/**
 * Defines the shape of a single account coming from the configuration
 * library
 */
export interface ConfigAccount {
  address: string; // ethereum address
  privateKey: string; // ethereum private key
  balance: string; // number, integer
}

/**
 * Defines the expected shape of the accounts coming from the
 * configuration library
 */
export type ConfigAccounts = Record<string, ConfigAccount>;
