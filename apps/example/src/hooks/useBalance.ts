import BigNumber from "bignumber.js";
import { useMemo } from "react";
import {
  type Address,
  erc20ABI,
  useAccount,
  useChainId,
  useContractRead,
} from "wagmi";

export const useTokenBalance = (
  tokenAddress: Address,
  overrideAddress?: Address,
) => {
  const { address: account } = useAccount();
  const chainId = useChainId();

  const { data, status, ...rest } = useContractRead({
    chainId: chainId,
    abi: erc20ABI,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [overrideAddress ?? account ?? "0x"],
    enabled: overrideAddress ? !!overrideAddress : !!account,
    watch: true,
  });

  return {
    ...rest,
    fetchStatus: status,
    balance: useMemo(
      () =>
        typeof data !== "undefined"
          ? new BigNumber(data.toString())
          : new BigNumber(0),
      [data],
    ),
  };
};
