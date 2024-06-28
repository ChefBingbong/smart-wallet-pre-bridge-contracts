import type { ChainId } from "@pancakeswap/chains";
import {
  Percent,
  type Currency,
  type CurrencyAmount,
} from "@pancakeswap/swap-sdk-core";
import type { PancakeSwapOptions } from "@pancakeswap/universal-router-sdk";
import type { Address } from "viem";
import {
  RouterTradeType,
  Routers,
  type SmartWalletTradeOptions,
} from "@smart-wallet/smart-router-sdk";

export const getSmartWalletOptions = (
  address: Address,
  isUsingPermit2: boolean,
  allowance: {
    permit2Allowances: {
      allowance: bigint;
      needsApproval: boolean;
    };
    smartWalletAllowances: {
      allowance: bigint;
      needsApproval: boolean;
    };
  },
  smartWalletDetails: never,
  chainId: ChainId,
  fees: never,
): SmartWalletTradeOptions => {
  return {
    account: address,
    chainId,
    smartWalletDetails: smartWalletDetails,
    SmartWalletTradeType: RouterTradeType.SmartWalletTradeWithPermit2,
    router: Routers.SmartOrderRouter,
    fees,
    isUsingPermit2: isUsingPermit2,
    hasApprovedPermit2: !allowance.permit2Allowances.needsApproval,
    hasApprovedRelayer: !allowance.smartWalletAllowances.needsApproval,
    walletPermitOptions: undefined,
    underlyingTradeOptions: {
      recipient: address,
      slippageTolerance: new Percent(1),
    },
  };
};
