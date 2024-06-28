import { GraphQLClient } from "graphql-request";
import { type Chain, createPublicClient, http } from "viem";

export const v3SubgraphClient = new GraphQLClient(
     "https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-chapel",
);
export const v2SubgraphClient = new GraphQLClient("https://proxy-worker-api.pancakeswap.com/bsc-exchange");

export const getClient = (chain: Chain) =>
     createPublicClient({
          chain,
          transport: http(chain.rpcUrls.default.http[0]),
          batch: {
               multicall: {
                    batchSize: 1024 * 200,
               },
          },
     });
