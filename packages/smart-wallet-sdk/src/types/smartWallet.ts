import type { ChainId } from "@pancakeswap/chains";
import type { SmartRouterTrade } from "@pancakeswap/smart-router";
import type { Currency, CurrencyAmount, TradeType } from "@pancakeswap/swap-sdk-core";
import type { MethodParameters } from "@pancakeswap/v3-sdk";
import type { Address, GetContractReturnType, Hex } from "viem";
import type { RouterTradeType, Routers } from "../encoder/buildOperation";
import type { PancakeSwapOptions } from "@pancakeswap/universal-router-sdk";
import type { smartWalletAbi as walletAbi } from "../abis/SmartWalletAbi";
import type { SmartWalletPermitOptions } from "./permit2";

export interface BaseTradeOptions<TOps> {
     account: Address;
     chainId: ChainId;
     router: Routers;
     underlyingTradeOptions: TOps;
}

export interface ClassicTradeOptions<TOps> extends BaseTradeOptions<TOps> {
     router: Routers;
}

export interface SmartWalletTradeOptions extends BaseTradeOptions<PancakeSwapOptions> {
     hasApprovedPermit2: boolean;
     hasApprovedRelayer: boolean;
     fees?: {
          feeTokenAddress: Address;
          feeAmount: CurrencyAmount<Currency>;
     };
     isUsingPermit2: boolean;
     walletPermitOptions?: SmartWalletPermitOptions;
     smartWalletDetails: { address: Address; nonce: bigint };
     SmartWalletTradeType: RouterTradeType;
     router: Routers;
}

export type UserOp = {
     readonly to: Address;
     readonly amount: bigint;
     readonly data: Hex;
};

export type SwapCall = MethodParameters & { address: Address };

export type ExecuteTradeCallback = {
     tradeType: RouterTradeType;
     signature: Hex;
     walletOperations: UserOp[];
     account: Address;
     chainId: ChainId;
};

export type FeeResponse = {
     gasEstimate: bigint;
     gasCostInQuoteToken: number;
     gasCostInBaseToken: number;
     gasCostInUSD: number;
};

export type SmartWalletGasParams = {
     feeAsset: string;
     trade: SmartRouterTrade<TradeType>;
     chainId: ChainId;
};
export type SmartWalletDetails = { address: Address; nonce: bigint; wallet: GetContractReturnType<typeof walletAbi> };
