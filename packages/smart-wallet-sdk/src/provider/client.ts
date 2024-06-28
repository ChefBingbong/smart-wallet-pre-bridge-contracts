import { ChainId } from "@pancakeswap/chains";
import { createPublicClient, fallback, http, type Chain, type PublicClient } from "viem";
import { CHAINS, PUBLIC_NODES } from "./chains";

export type CreatePublicClientParams = {
     // biome-ignore lint/suspicious/noExplicitAny: <explanation>
     transportSignal?: any;
};

export function createViemPublicClients({ transportSignal }: CreatePublicClientParams = {}) {
     return CHAINS.reduce(
          (prev, cur) => {
               return {
                    // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                    ...prev,
                    [cur.id]: createPublicClient({
                         chain: cur,
                         transport: fallback(
                              (PUBLIC_NODES[cur.id as ChainId] as string[]).map((url) =>
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

export const viemClients = createViemPublicClients();

export const getViemClients = createViemPublicClientGetter({ viemClients });

type CreateViemPublicClientGetterParams = {
     viemClients?: Record<ChainId, PublicClient>;
} & CreatePublicClientParams;

export function createViemPublicClientGetter({
     viemClients: viemClientsOverride,
     ...restParams
}: CreateViemPublicClientGetterParams = {}) {
     const clients = viemClientsOverride || createViemPublicClients(restParams);

     return function getClients({ chainId }: { chainId?: ChainId }): PublicClient {
          return clients[chainId as ChainId];
     };
}

const createClients = <TClient extends PublicClient>(chains: Chain[]): Record<ChainId, TClient> => {
     return chains.reduce(
          (prev: Record<ChainId, TClient>, cur: Chain) => {
               const clientConfig = {
                    chain: cur,
                    transport: fallback(
                         (PUBLIC_NODES[cur.id as ChainId] as string[]).map((url) =>
                              http(url, {
                                   timeout: 15_000,
                              }),
                         ),
                         {
                              rank: false,
                         },
                    ),
                    batch: {
                         multicall: {
                              batchSize: cur.id === ChainId.POLYGON_ZKEVM ? 128 : 154 * 200,
                              wait: 16,
                         },
                    },
               };
               const client = createPublicClient(clientConfig);
               return {
                    // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                    ...prev,
                    [cur.id]: client,
               };
          },
          {} as Record<ChainId, TClient>,
     );
};

export const publicClients = createClients<PublicClient>(CHAINS);

export const getViemClient = ({ chainId }: { chainId: ChainId }) => {
     return publicClients[chainId];
};
