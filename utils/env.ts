import "dotenv/config";

const MAX_ACCOUNTS = 10;

export function getNodeUrl(network: string): string {
     if (network) {
          const uri = process.env[`NODE_URI_${network.toUpperCase()}`];
          if (uri && uri !== "") {
               return uri;
          }
     }
     console.warn(`No node uri for network ${network}`);
     return "";
}

export function getMnemonic(network: string): string {
     const mnemonic = process.env[`${network.toUpperCase()}_MNEMONIC`] as string;
     if (!mnemonic) {
          console.warn(`No mnemonic for network ${network}`);
          return "test test test test test test test test test test test junk";
     }
     return mnemonic;
}

export function getPrivateKeys(network: string): string[] {
     const privateKeys = [];
     for (let i = 1; i <= MAX_ACCOUNTS; i++) {
          const privateKey = process.env[`${network.toUpperCase()}_${i}_PRIVATE_KEY`];
          if (!!privateKey) privateKeys.push(privateKey);
     }
     if (privateKeys.length === 0) {
          console.warn(`No private keys for network ${network}`);
     }
     return privateKeys;
}

type ACCOUNTS_TYPE = "MNEMONIC" | "PRIVATE_KEYS";

export function getAccountsType(network: string): ACCOUNTS_TYPE {
     const accountsType = process.env[`${network.toUpperCase()}_ACCOUNTS_TYPE`];
     if (!accountsType || accountsType === "PRIVATE_KEYS") return "PRIVATE_KEYS";
     if (accountsType != "MNEMONIC" && accountsType != "PRIVATE_KEYS") {
          console.warn(`Accounts type incorrect for network ${network} using fallback`);
          return "PRIVATE_KEYS";
     }
     return "MNEMONIC";
}

export function getAccounts(network: string): { mnemonic: string } | string[] {
     if (getAccountsType(network) == "PRIVATE_KEYS") {
          return getPrivateKeys(network);
     }
     return {
          mnemonic: getMnemonic(network),
     };
}

export function getEtherscanAPIKeys(networks: string[]): { [network: string]: string } {
     const apiKeys: { [network: string]: string } = {};
     // biome-ignore lint/complexity/noForEach: <explanation>
     networks.forEach((network) => {
          const networkApiKey = process.env[`ETHERSCAN_API_KEY`];
          if (!networkApiKey) {
               console.warn(`No etherscan api key for ${network}`);
          } else {
               switch (network) {
                    case "ethereum-ropsten":
                         apiKeys["ropsten"] = networkApiKey;
                         break;
                    case "ethereum-rinkeby":
                         apiKeys["rinkeby"] = networkApiKey;
                         break;
                    case "ethereum-goerli":
                         apiKeys["goerli"] = networkApiKey;
                         break;
                    case "ethereum-kovan":
                         apiKeys["kovan"] = networkApiKey;
                         break;
                    case "ethereum":
                         apiKeys["mainnet"] = networkApiKey;
                         break;
                    case "bnb":
                         apiKeys["bsc"] = networkApiKey;
                         break;
                    case "optimism":
                         apiKeys["optimisticEthereum"] = networkApiKey;
                         break;
                    case "optimism-kovan":
                         apiKeys["optimisticKovan"] = networkApiKey;
                         break;
                    case "arbitrum":
                         // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                         apiKeys["arbitrumOne"] = networkApiKey;
                         break;
                    case "arbitrum-rinkeby":
                         apiKeys.arbitrumTestnet = networkApiKey;
                         break;
                    case "polygon-mumbai":
                         apiKeys.polygonMumbai = networkApiKey;
                         break;
                    default:
                         apiKeys[network] = networkApiKey;
                         break;
               }
          }
     });
     return apiKeys;
}

export function isTesting(): boolean {
     return process.env.TEST;
}

export function isHardhatCompile(): boolean {
     return process.argv[process.argv.length - 1] == "compile";
}

export function isHardhatClean(): boolean {
     return process.argv[process.argv.length - 1] == "clean";
}
