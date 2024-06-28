import type { ChainId } from "@pancakeswap/chains";
import { configureChains } from "wagmi";
import { mainnet } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { CHAINS, PUBLIC_NODES, type ExtendedChainId } from "~/config/chains";

const mostNodesConfig = Object.values(PUBLIC_NODES).reduce((prev, cur) => {
  return cur.length > prev ? cur.length : prev;
}, 0);

const { publicClient, chains } = configureChains(
  CHAINS,
  Array.from({ length: mostNodesConfig })
    .map((_, i) => i)
    .map((i) => {
      return jsonRpcProvider({
        rpc: (chain) => {
          if (
            process.env.NODE_ENV === "test" &&
            chain.id === mainnet.id &&
            i === 0
          ) {
            return { http: "https://ethereum.publicnode.com" };
          }
          return PUBLIC_NODES[chain.id as ChainId & ExtendedChainId]?.[i]
            ? {
                http: PUBLIC_NODES[chain.id as ChainId & ExtendedChainId][i],
              }
            : null;
        },
      });
    }),
  {
    batch: {
      multicall: {
        batchSize: 1024 * 200,
        wait: 16,
      },
    },
    pollingInterval: 6_000,
  },
);
export { chains, publicClient };
export const noopStorage = {
  getItem: (_key: never) => "",
  setItem: (_key: never, _value: never) => null,
  removeItem: (_key: never) => null,
};
