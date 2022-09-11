declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INFURA_API_KEY?: string;
      COINMARKETCAP_API_KEY?: string;
      ETHERSCAN_API_KEY?: string;
      LOCAL_GETH_INSTANCE_URL?: string;
      FORKING_ENABLED?: string;
    }
  }
}

export default {};
