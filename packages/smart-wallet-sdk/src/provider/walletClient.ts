import type { ChainId } from "@pancakeswap/chains";
import {
      type PublicClient,
      createPublicClient,
      http,
      type Chain,
      type Client,
      type WalletClient,
      createWalletClient,
} from "viem";
import { CHAINS } from "./chains";
import { privateKeyToAccount } from "viem/accounts";

const account = "0x22a557c558a2fa235e7d67839b697fc2fb1b53c8705ada632c07dee1eac330a4";
const userAccount = "0x225bfce31326a62a6360dfc47c1b8f9ba0ad5b45c988fb66f2494cacd106048a";
export const userSigner = privateKeyToAccount(userAccount);
export const signer = privateKeyToAccount(account);

const createClients = <TClient extends Client>(chains: Chain[]) => {
      return (type: "Wallet" | "Public"): Record<ChainId, TClient> => {
            return chains.reduce(
                  (prev, cur) => {
                        const clientConfig = { chain: cur, transport: http() };
                        const client =
                              type === "Wallet"
                                    ? createWalletClient({ ...clientConfig, account: signer, key: "SmartWaletClient" })
                                    : createPublicClient(clientConfig);
                        return {
                              // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                              ...prev,
                              [cur.id]: client,
                        };
                  },
                  {} as Record<ChainId, TClient>,
            );
      };
};

const createUserClients = <TClient extends Client>(chains: Chain[]) => {
      return (type: "Wallet" | "Public"): Record<ChainId, TClient> => {
            return chains.reduce(
                  (prev, cur) => {
                        const clientConfig = { chain: cur, transport: http() };
                        const client =
                              type === "Wallet"
                                    ? createWalletClient({ ...clientConfig, account: userAccount })
                                    : createPublicClient(clientConfig);
                        return {
                              // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                              ...prev,
                              [cur.id]: client,
                        };
                  },
                  {} as Record<ChainId, TClient>,
            );
      };
};

const publicClients = createClients<PublicClient>(CHAINS)("Public");
const walletClients = createClients<WalletClient>(CHAINS)("Wallet");

const walletUserClients = createUserClients<WalletClient>(CHAINS)("Wallet");
export const getUserWalletClient = ({ chainId }: { chainId: ChainId }) => {
      return walletUserClients[chainId];
};

export const getPublicClient = ({ chainId }: { chainId: ChainId }) => {
      return publicClients[chainId];
};

export type Provider = ({ chainId }: { chainId: ChainId }) => PublicClient;

export const getWalletClient = ({ chainId }: { chainId: ChainId }) => {
      return walletClients[chainId];
};

// export const signer = privateKeyToAccount(account);
