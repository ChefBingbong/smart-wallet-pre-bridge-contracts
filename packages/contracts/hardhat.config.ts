import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "@typechain/hardhat/dist/type-extensions";
import "hardhat-gas-reporter";
import "solidity-coverage";

import * as env from "./utils/env";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: "https://eth.llamarpc.com",
        blockNumber: 19595025,
      },
      gas: 3000000,
      // url: "http://127.0.0.1:8545",
      // chainId: 31337,
    },
    ethereumMainnet: {
      url: "https://mainnet.infura.io/v3/e110322e378a4f268172084e63ac8b8d",
      accounts: env.getAccounts("bnb-testnet"),
    },
    ethereumTestnet: {
      url: "https://goerli.infura.io/v3/e110322e378a4f268172084e63ac8b8d",
      accounts: env.getAccounts("bnb-testnet"),
    },
    polygonMainnet: {
      url: "https://polygon-mainnet.infura.io/v3/e110322e378a4f268172084e63ac8b8d",
      accounts: env.getAccounts("bnb-testnet"),
    },
    polygonTestnet: {
      url: "https://rpc.ankr.com/polygon_mumbai",
      accounts: env.getAccounts("bnb-testnet"),
    },
    avalancheMainnet: {
      url: "https://rpc-mumbai.maticvigil.com/https://rpc-mumbai.maticvigil.com/",
      accounts: env.getAccounts("bnb-testnet"),
    },
    avalancheTestnet: {
      url: "https://avalanche-fuji.infura.io/v3/47b89f1cf0cd47419f9a57674278610b",
      accounts: env.getAccounts("bnb-testnet"),
    },
    arbitrumMainnet: {
      url: "https://arbitrum-mainnet.infura.io/v3/47b89f1cf0cd47419f9a57674278610b",
      accounts: env.getAccounts("bnb-testnet"),
    },
    arbitrumTestnet: {
      url: "https://arbitrum-goerli.infura.io/v3/47b89f1cf0cd47419f9a57674278610b",
      accounts: env.getAccounts("bnb-testnet"),
    },
    klaytnMainnet: {
      url: "https://public-node-api.klaytnapi.com/v1/cypress",
      accounts: env.getAccounts("bnb-testnet"),
    },
    klaytnTestnet: {
      url: "https://api.baobab.klaytn.net:8651",
      accounts: env.getAccounts("bnb-testnet"),
    },
    fantomMainnet: {
      url: "https://rpc.ftm.tools/",
      accounts: env.getAccounts("bnb-testnet"),
    },
    fantomTestnet: {
      url: "https://rpc.testnet.fantom.network/",
      accounts: env.getAccounts("bnb-testnet"),
    },
    optimismMainnet: {
      url: "https://optimism-mainnet.infura.io/v3/e110322e378a4f268172084e63ac8b8d",
      accounts: env.getAccounts("bnb-testnet"),
    },
    optimismTestnet: {
      url: "https://optimism-goerli.infura.io/v3/e110322e378a4f268172084e63ac8b8d",
      accounts: env.getAccounts("bnb-testnet"),
    },
    gnosisMainnet: {
      url: "https://rpc.gnosischain.com/",
      accounts: env.getAccounts("bnb-testnet"),
    },
    auroraMainnet: {
      url: "https://aurora-mainnet.infura.io/v3/e110322e378a4f268172084e63ac8b8d",
      accounts: env.getAccounts("bnb-testnet"),
    },
    auroraTestnet: {
      url: "https://aurora-testnet.infura.io/v3/e110322e378a4f268172084e63ac8b8d",
      accounts: env.getAccounts("bnb-testnet"),
    },
    bnbMainnet: {
      url: "https://bsc-dataseed1.binance.org/",
      accounts: env.getAccounts("bnb-testnet"),
    },
    bnbTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: env.getAccounts("bnb-testnet"),
    },
    moonbeamMainnet: {
      url: "https://moonbase-alpha.public.blastapi.io",
      accounts: env.getAccounts("bnb-testnet"),
    },
    moonbeamTestnet: {
      url: "https://rpc.api.moonriver.moonbeam.network/",
      accounts: env.getAccounts("bnb-testnet"),
    },
    zkEvmTestnet: {
      url: "https://polygon-zkevm-testnet.rpc.thirdweb.com",
      accounts: env.getAccounts("bnb-testnet"),
    },
  },

  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    user: {
      default: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          evmVersion: "istanbul",
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: {
            enabled: true,
            runs: 400,
          },
          metadata: {
            bytecodeHash: "none",
          },
        },
      },
    ],
  },
  gasReporter: {
    currency: process.env.COINMARKETCAP_DEFAULT_CURRENCY || "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    enabled: process.env.REPORT_GAS ? true : false,
    showMethodSig: true,
    onlyCalledMethods: false,
    excludeContracts: ["ERC20"],
  },
  etherscan: {
    apiKey: {
      ...env.getEtherscanAPIKeys([
        "ethereum-ropsten",
        "ethereum-rinkeby",
        "ethereum-kovan",
        "ethereum-goerli",
        "ethereum",
        "optimism",
        "optimism-kovan",
        "arbitrum",
        "arbitrum-rinkeby",
        "polygon",
        "polygon-mumbai",
        "bnb",
        "bnb-testnet",
        "bscTestnet",
      ]),
      "base-goerli": "PLACEHOLDER_STRING",
    },
    customChains: [
      {
        network: "base-goerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org",
        },
      },
    ],
  },
};

export default config;
