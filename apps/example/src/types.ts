import type { ChainId } from "@pancakeswap/chains";
import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { Address } from "viem";

export type Evaluate<type> = { [key in keyof type]: type[key] };

export type ExactPartial<type> = {
  [key in keyof type]?: type[key] | undefined;
};

type RecursiveDeps<deps extends readonly unknown[]> = deps extends [
  infer dep,
  ...infer rest,
]
  ? [dep] | [dep, ...RecursiveDeps<rest>]
  : [];

export function createQueryKey<
  key extends string,
  deps extends readonly unknown[],
>(id: key) {
  return (deps?: RecursiveDeps<deps>) =>
    [id, ...(deps ?? [])] as unknown as [key, ...deps];
}

export type UseQueryParameters<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = Evaluate<
  ExactPartial<
    Omit<
      UseQueryOptions<queryFnData, error, data, queryKey>,
      | "queryFn"
      | "queryHash"
      | "queryKey"
      | "queryKeyHashFn"
      | "suspense"
      | "throwOnError"
    >
  >
>;

export type TradeQuotePayload = {
  toAsset: string;
  fromAsset: string;
  chainId: ChainId;
  amount: string;
  account: Address;
};
