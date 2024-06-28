import { ChainId } from "@pancakeswap/chains";
import { GraphQLClient } from "graphql-request";
import {
  createPublicClient,
  fallback,
  getContract,
  type GetContractReturnType,
  http,
  type PublicClient,
} from "viem";
import { CHAINS, PUBLIC_NODES } from "./chains";
import {
  type GetGasLimitOnChainParams,
  MULTICALL_ADDRESS,
  iMulticallABI,
} from "@pancakeswap/multicall";

export type CreatePublicClientParams = {
  transportSignal?: AbortSignal;
};

export function createViemPublicClients({
  transportSignal,
}: CreatePublicClientParams = {}) {
  return CHAINS.reduce(
    (prev, cur) => {
      return {
        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
        ...prev,
        [cur.id]: createPublicClient({
          chain: cur,
          transport: fallback(
            (PUBLIC_NODES[cur.id] as string[]).map((url) =>
              http(url, {
                timeout: 10_000,
                fetchOptions: {
                  signal: transportSignal,
                },
              }),
            ),
            {
              rank: false,
            },
          ),
          batch: {
            multicall: {
              batchSize: cur.id === ChainId.POLYGON_ZKEVM ? 128 : 1024 * 200,
              wait: 16,
            },
          },
          pollingInterval: 6_000,
        }),
      };
    },
    {} as Record<ChainId, PublicClient>,
  );
}

export const v3SubgraphClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-chapel",
);
export const v2SubgraphClient = new GraphQLClient(
  "https://proxy-worker-api.pancakeswap.com/bsc-exchange",
);

export function getMulticallContract({
  chainId,
  client,
}: {
  chainId: ChainId;
  client: GetGasLimitOnChainParams["client"] & PublicClient;
}): GetContractReturnType<
  typeof iMulticallABI,
  PublicClient & GetGasLimitOnChainParams["client"]
> {
  const address = MULTICALL_ADDRESS[chainId];
  if (!address) {
    throw new Error(`PancakeMulticall not supported on chain ${chainId}`);
  }

  return getContract({ abi: iMulticallABI, address, publicClient: client });
}

export async function getGasLimitOnChain({
  chainId,
  client,
}: GetGasLimitOnChainParams) {
  const multicall = getMulticallContract({
    chainId,
    client: client as PublicClient & GetGasLimitOnChainParams["client"],
  });
  const gasLeft = (await multicall?.read?.gasLeft?.()) as bigint;
  return gasLeft;
}
