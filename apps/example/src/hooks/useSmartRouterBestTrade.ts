import type { ChainId } from "@pancakeswap/chains";
import { SmartRouter, type SmartRouterTrade } from "@pancakeswap/smart-router";
import {
  CurrencyAmount,
  TradeType,
  type Currency,
} from "@pancakeswap/swap-sdk-core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDeferredValue } from "react";
import type { Address } from "viem";
import {
  v2SubgraphClient,
  v3SubgraphClient,
  // publicClient,
} from "~/config/client";
import { publicClient } from "~/config/wagmiConfig";
import {
  createQueryKey,
  type Evaluate,
  type ExactPartial,
  type TradeQuotePayload,
  type UseQueryParameters,
} from "../types";
import useDebounce from "./useDebounce";

const getTradeQuoteQueryKey = createQueryKey<
  "fetch-trade-quotes",
  [ExactPartial<TradeQuotePayload>]
>("fetch-trade-quotes");

type GetTradeQuoteQueryKey = ReturnType<typeof getTradeQuoteQueryKey>;

type GetTradeQuoteReturnType = SmartRouterTrade<TradeType> | undefined;

export type UseTradeQuoteReturnType<selectData = GetTradeQuoteReturnType> =
  UseQueryResult<selectData, Error>;

type TradeQuotePayloadParsed = {
  toAsset: Currency | undefined;
  fromAsset: Currency | undefined;
  chainId: ChainId | undefined;
  amount: CurrencyAmount<Currency> | undefined;
  account: Address | undefined;
};

export type UseTradeQuoteParameters<selectData = GetTradeQuoteReturnType> =
  Evaluate<
    TradeQuotePayloadParsed &
      UseQueryParameters<
        Evaluate<GetTradeQuoteReturnType>,
        Error,
        selectData,
        GetTradeQuoteQueryKey
      >
  >;

export const useSmartRouterBestTrade = <selectData = GetTradeQuoteReturnType>(
  parameters: UseTradeQuoteParameters<selectData>,
) => {
  const { chainId, fromAsset, toAsset, amount, account } = parameters;

  const deferQuotientRaw = useDeferredValue(amount.quotient.toString());
  const deferQuotient = useDebounce(deferQuotientRaw, 500);

  return useQuery({
    queryKey: getTradeQuoteQueryKey([
      {
        chainId: chainId as never,
        toAsset: toAsset?.symbol,
        fromAsset: fromAsset?.symbol,
        amount: deferQuotient,
        account,
      },
    ]),
    enabled: !!(fromAsset && deferQuotient && toAsset && account && chainId),
    queryFn: async ({ queryKey }) => {
      const params = queryKey[1];

      if (!params.amount || !params.fromAsset || !params.toAsset)
        return undefined;
      if (!toAsset || !fromAsset || !amount || !chainId) return undefined;

      const quoteProvider = SmartRouter.createQuoteProvider({
        onChainProvider: () => publicClient({ chainId }) as never,
      });

      const [v2Pools, v3Pools] = await Promise.all([
        SmartRouter.getV2CandidatePools({
          onChainProvider: () => publicClient({ chainId }),
          v2SubgraphProvider: () => v2SubgraphClient,
          v3SubgraphProvider: () => v3SubgraphClient,
          currencyA: fromAsset,
          currencyB: toAsset,
        } as never),
        SmartRouter.getV3CandidatePools({
          onChainProvider: () => publicClient({ chainId }),
          subgraphProvider: () => v3SubgraphClient,
          currencyA: fromAsset,
          currencyB: toAsset,
          subgraphFallback: false,
        } as never),
      ]);
      const pools = [...v2Pools, ...v3Pools];

      const deferAmount = CurrencyAmount.fromRawAmount(
        amount?.currency,
        deferQuotient,
      );
      const res = await SmartRouter.getBestTrade(
        deferAmount,
        toAsset,
        TradeType.EXACT_INPUT,
        {
          gasPriceWei: await publicClient({ chainId }).getGasPrice(),
          maxHops: 2,
          maxSplits: 2,
          poolProvider: SmartRouter.createStaticPoolProvider(pools),
          quoteProvider,
          quoterOptimization: true,
        },
      );
      console.log(res, "heyyy");
      return res ?? undefined;
    },
    //     enabled: !!(fromAsset && amount && toAsset && account && chainId),

    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 15000,
    refetchInterval: 15000,
  });
};
