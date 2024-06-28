// eslint-disable-next-line camelcase
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBlockNumber, useChainId, usePublicClient } from "wagmi";
import { publicClient } from "~/config/wagmiConfig";

const REFRESH_BLOCK_INTERVAL = 6000;
export const FAST_INTERVAL = 10000;
export const SLOW_INTERVAL = 60000;

export const usePollBlockNumber = () => {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({
    chainId,
    onBlock: (data) => {
      queryClient.setQueryData(["blockNumber", chainId], Number(data));
    },
    onSuccess: (data) => {
      if (
        !queryClient.getQueryCache().find({
          queryKey: ["initialBlockNumber", chainId],
        })?.state?.data
      ) {
        queryClient.setQueryData(["initialBlockNumber", chainId], Number(data));
      }
      if (
        !queryClient.getQueryCache().find({
          queryKey: ["initialBlockTimestamp", chainId],
        })?.state?.data
      ) {
        const fetchInitialBlockTimestamp = async () => {
          const provider = publicClient({ chainId });
          if (provider) {
            const block = await provider.getBlock({ blockNumber: data });
            queryClient.setQueryData(
              ["initialBlockTimestamp", chainId],
              Number(block.timestamp),
            );
          }
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchInitialBlockTimestamp();
      }
    },
  });

  useQuery({
    queryKey: ["blockNumberFetcher", chainId],

    queryFn: async () => {
      queryClient.setQueryData(["blockNumber", chainId], Number(blockNumber));
      return null;
    },

    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useQuery({
    queryKey: [FAST_INTERVAL, "blockNumber", chainId],
    queryFn: async () => Number(blockNumber),
    enabled: Boolean(chainId),
    refetchInterval: FAST_INTERVAL,
  });

  useQuery({
    queryKey: [SLOW_INTERVAL, "blockNumber", chainId],
    queryFn: async () => Number(blockNumber),
    enabled: Boolean(chainId),
    refetchInterval: SLOW_INTERVAL,
  });
};

export const useCurrentBlock = (): number => {
  const chainId = useChainId();
  const { data: currentBlock = 0 } = useQuery({
    queryKey: ["blockNumber", chainId],
    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return Number(currentBlock);
};

export const useChainCurrentBlock = (chainId: number): number => {
  const activeChainId = useChainId();
  const provider = usePublicClient({ chainId });

  const { data: currentBlock = 0 } = useQuery({
    queryKey:
      activeChainId === chainId
        ? ["blockNumber", chainId]
        : ["chainBlockNumber", chainId],

    queryFn: async () => {
      const blockNumber = await provider.getBlockNumber();
      return Number(blockNumber);
    },
    enabled: activeChainId !== chainId,
    ...(activeChainId !== chainId && {
      refetchInterval: REFRESH_BLOCK_INTERVAL,
    }),
  });
  return currentBlock;
};

export const useInitialBlock = (): number => {
  const chainId = useChainId();
  const { data: initialBlock = 0 } = useQuery({
    queryKey: ["initialBlockNumber", chainId],
    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return Number(initialBlock);
};

export const useInitialBlockTimestamp = (): number => {
  const chainId = useChainId();
  const { data: initialBlockTimestamp = 0 } = useQuery({
    queryKey: ["initialBlockTimestamp", chainId],
    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return Number(initialBlockTimestamp);
};
