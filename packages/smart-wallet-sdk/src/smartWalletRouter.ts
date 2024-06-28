/* eslint-disable lines-between-class-members */
import type { ChainId } from "@pancakeswap/chains";
import { MaxUint256, PermitBatchData, type PermitTransferFromData } from "@pancakeswap/permit2-sdk";
import { getTokenPrices } from "@pancakeswap/price-api-sdk";
import { CurrencyAmount, type Currency, type Token, type TradeType } from "@pancakeswap/sdk";
import { SMART_ROUTER_ADDRESSES, SwapRouter, type SmartRouterTrade, type SwapOptions } from "@pancakeswap/smart-router";
import {
     PancakeSwapUniversalRouter as UniversalRouter,
     getUniversalRouterAddress,
     type PancakeSwapOptions,
} from "@pancakeswap/universal-router-sdk";
import type { BaseError } from "abitype";
import { erc20Abi as ERC20ABI, formatTransactionRequest, type Address, type Hex, type PublicClient } from "viem";
import { bscTestnet } from "viem/chains";
import { getContractError, getTransactionError, parseAccount } from "viem/utils";
import { Deployments } from "./constants/deploymentUtils";
import { RouterTradeType, Routers } from "./encoder/buildOperation";
import { OperationType, WalletOperationBuilder, encodeOperation } from "./encoder/walletOperations";
import { permit2TpedData, type PermitWithWithWitness } from "./permit/permit2TypedData";
import { getViemClient } from "./provider/client";
import { getPublicClient, getWalletClient, signer } from "./provider/walletClient";
import { ClasicTrade } from "./trades/classicTrade";
import type { ClassicTradeOptions, SmartWalletGasParams, SmartWalletTradeOptions, UserOp } from "./types/smartWallet";
import { getErc20Contract, getSmartWallet, getSmartWalletFactory } from "./utils/contracts";
import { AccountNotFoundError } from "./utils/error";
import { getNativeWrappedToken, getTokenPriceByNumber, getUsdGasToken } from "./utils/estimateGas";
import { getSwapRouterAddress } from "./utils/getSwapRouterAddress";
import { typedMetaTx } from "./utils/typedMetaTx";

function calculateGasMargin(value: bigint, margin = 1000n): bigint {
     return (value * (10000n + margin)) / 10000n;
}
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export abstract class SmartWalletRouter {
     public static account: Address;
     public static smartWallet: Address;
     public static chainId: ChainId;
     public static isInitialized = false;

     public static tradeConfig: Partial<ClassicTradeOptions<PancakeSwapOptions>> & SmartRouterTrade<TradeType> =
          {} as Partial<ClassicTradeOptions<PancakeSwapOptions>> & SmartRouterTrade<TradeType>;

     public static updateConfig(config: SmartWalletTradeOptions) {
          SmartWalletRouter.account = config.account;
          SmartWalletRouter.smartWallet = config.smartWalletDetails.address;
          SmartWalletRouter.chainId = config.chainId;
     }

     public static buildClassicTrade<UTradeOps extends SwapOptions & PancakeSwapOptions>(
          trade: SmartRouterTrade<TradeType>,
          options: ClassicTradeOptions<UTradeOps>,
     ) {
          SmartWalletRouter.tradeConfig = { ...options, ...trade };
          const routeOptions = options.underlyingTradeOptions;
          if (options.router === Routers.UniversalRouter) {
               const { value, calldata } = UniversalRouter.swapERC20CallParameters(trade, routeOptions);
               const swapRouterAddress = getUniversalRouterAddress(options.chainId);
               return { address: swapRouterAddress, calldata, value };
          }

          const { value, calldata } = SwapRouter.swapCallParameters(trade, routeOptions);
          const swapRouterAddress = getSwapRouterAddress(options.chainId);
          return { address: swapRouterAddress, calldata, value };
     }

     public static buildSmartWalletTrade(trade: SmartRouterTrade<TradeType>, options: SmartWalletTradeOptions) {
          SmartWalletRouter.tradeConfig = { ...options, ...trade };

          if (options.SmartWalletTradeType === RouterTradeType.SmartWalletTradeWithPermit2 && !options.fees) {
               throw new Error("Fee Object must be provided with smart wallet trade");
          }

          const planner = new WalletOperationBuilder();
          const tradeCommand = new ClasicTrade(trade, options);
          tradeCommand.encode(planner);

          return SmartWalletRouter.encodePlan(planner, options);
     }

     public static encodePlan(planner: WalletOperationBuilder, config: SmartWalletTradeOptions) {
          const { userOps, externalUserOps } = planner;
          const { address, nonce } = config.smartWalletDetails;

          const smartWalletTypedData = typedMetaTx(userOps, nonce, address, config.chainId);
          const feeAmount = config.fees?.feeAmount?.quotient as bigint;

          const permit2MetaData = async (nonce: bigint) => {
               return permit2TpedData(config.chainId, "0x501B55184813f7a29eb98DECD8EC9B6D07DEB263", address, nonce);
          };
          return {
               permit2MetaData,
               smartWalletDetails: smartWalletTypedData,
               externalUserOps,
               config: config,
          };
     }

     public static appendPermit2UserOp(signature: Hex, account: Address, permit2TypedData: PermitBatchData) {
          const permitPlanner = new WalletOperationBuilder();
          const transferAmount = permit2TypedData.values.details[0].amount as bigint;

          console.log(permit2TypedData.values.spender);
          permitPlanner.addUserOperation(
               OperationType.PERMIT2_TRANSFER_TO_RELAYER_WITNESS,
               [
                    transferAmount,
                    permit2TypedData.values.details[0].token as Address,
                    account,
                    Deployments[97].Permit2,
                    permit2TypedData.values as never,
                    signature,
               ],
               permit2TypedData.values.spender as Address,
          );
          return permitPlanner;
     }

     public static async sendTransactionFromRelayer(
          chainId: ChainId,
          txConfig: UserOp,
          config?: { externalClient?: PublicClient },
     ) {
          const asyncClient = getPublicClient({ chainId });
          const externalClient = config?.externalClient;
          const client = externalClient || getWalletClient({ chainId });

          if (!client.account) throw new AccountNotFoundError();
          const account = parseAccount(client.account);

          try {
               const gasPrice = await asyncClient.getGasPrice();
               const gasE = await asyncClient.estimateGas({
                    to: txConfig.to,
                    value: txConfig.amount,
                    data: txConfig.data,
                    account,
                    // gas: 20000,
               });

               const tradeMeta = await client.prepareTransactionRequest({
                    to: txConfig.to,
                    value: txConfig.amount,
                    data: txConfig.data,
                    chain: bscTestnet,
                    gas: calculateGasMargin(gasE),
                    gasPrice,

                    account,
               });
               const chainFormat = client.chain?.formatters?.transactionRequest?.format;
               const format = chainFormat || formatTransactionRequest;

               if (account.type === "local" && externalClient) {
                    const serializer = client.chain?.serializers?.transaction;
                    const signedTx = await account.signTransaction(format(tradeMeta), { serializer });
                    const txHash = await client.sendRawTransaction({
                         serializedTransaction: signedTx,
                    });
                    return await asyncClient.waitForTransactionReceipt({
                         hash: txHash,
                         confirmations: 2,
                    });
               }

               const txHash = await client.sendTransaction({ ...tradeMeta });
               return await asyncClient.waitForTransactionReceipt({
                    hash: txHash,
                    confirmations: 1,
               });
          } catch (error: unknown) {
               const errParams = { ...txConfig, account: client.account };
               throw getTransactionError(error as BaseError, errParams);
          }
     }

     public static async estimateSmartWalletFees({ feeAsset, trade, chainId }: SmartWalletGasParams): Promise<{
          gasEstimate: bigint;
          gasCostInNative: CurrencyAmount<Token>;
          gasCostInQuoteToken: CurrencyAmount<Currency>;
          gasCostInBaseToken: CurrencyAmount<Currency>;
          gasCostInUSD: CurrencyAmount<Currency>;
          gasCost: CurrencyAmount<Currency>;
     }> {
          const publicClient = getPublicClient({ chainId: 56 });
          const usdToken = getUsdGasToken(56);
          if (!usdToken) {
               throw new Error(`No valid usd token found on chain ${chainId}`);
          }
          const nativeWrappedToken = getNativeWrappedToken(56);
          if (!nativeWrappedToken) {
               throw new Error(`Unsupported chain ${chainId}. Native wrapped token not found.`);
          }

          const inputCurrency = trade.inputAmount.currency;
          const outputCurrency = trade.outputAmount.currency;

          const [quoteCurrencyUsdPrice, baseCurrencyUsdPrice, nativeCurrencyUsdPrice] = await getTokenPrices(56, [
               "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
               "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
               nativeWrappedToken.address,
          ]);

          const quotePriceInUsd = getTokenPriceByNumber(usdToken, outputCurrency, quoteCurrencyUsdPrice?.priceUSD);
          const basePriceInUsd = getTokenPriceByNumber(usdToken, inputCurrency, baseCurrencyUsdPrice?.priceUSD);
          const nativePriceInUsd = getTokenPriceByNumber(
               usdToken,
               nativeWrappedToken,
               nativeCurrencyUsdPrice?.priceUSD,
          );

          const quotePriceInNative =
               quotePriceInUsd && nativePriceInUsd ? nativePriceInUsd.multiply(quotePriceInUsd.invert()) : undefined;

          const basePriceInNative =
               basePriceInUsd && nativePriceInUsd ? nativePriceInUsd.multiply(basePriceInUsd.invert()) : undefined;

          let tradeGasEstimation =
               // biome-ignore lint/suspicious/noExplicitAny: <explanation>
               0n;

          //cant estimate the SW exec itself because we need signature to pass ec recovery
          // 50000 is accurate average estimation of its cost
          const estimationOfSmartWalletBatchExec = 283498n;
          const gasPrice = await publicClient.getGasPrice();
          const baseGasCostWei = gasPrice * (tradeGasEstimation + estimationOfSmartWalletBatchExec);
          const totalGasCostNativeCurrency = CurrencyAmount.fromRawAmount(nativeWrappedToken, baseGasCostWei);

          let gasCostInQuoteToken: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(outputCurrency, 0n);
          let gasCostInBaseToken: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(outputCurrency, 0n);
          let gasCostInUSD: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(usdToken, 0n);

          if (inputCurrency.isNative) gasCostInBaseToken = totalGasCostNativeCurrency;
          if (outputCurrency.isNative) gasCostInQuoteToken = totalGasCostNativeCurrency;

          if (!inputCurrency.isNative && !outputCurrency.isNative && quotePriceInNative && basePriceInNative) {
               gasCostInQuoteToken = quotePriceInNative.quote(totalGasCostNativeCurrency);
               gasCostInBaseToken = basePriceInNative.quote(totalGasCostNativeCurrency);
          }

          if (nativePriceInUsd) {
               gasCostInUSD = nativePriceInUsd.quote(totalGasCostNativeCurrency);
          }

          const gasCost = feeAsset === inputCurrency.symbol ? gasCostInBaseToken : gasCostInQuoteToken;
          return {
               gasEstimate: tradeGasEstimation,
               gasCostInNative: totalGasCostNativeCurrency,
               gasCostInQuoteToken,
               gasCostInBaseToken,
               gasCostInUSD,
               gasCost,
          };
     }

     public static async getContractAllowance(
          tokenAddress: Address,
          owner: Address,
          spender: Address,
          chainId: ChainId,
          amountToCheck?: bigint,
     ): Promise<{ allowance: bigint; needsApproval: boolean }> {
          try {
               const client = getViemClient({ chainId });

               const allowance = await client.readContract({
                    functionName: "allowance",
                    args: [owner, spender],
                    address: tokenAddress,
                    abi: ERC20ABI,
               });

               let needsApproval = false;
               if (amountToCheck && allowance < amountToCheck) {
                    needsApproval = true;
                    return { allowance, needsApproval };
               }

               return { allowance, needsApproval };
          } catch (error) {
               throw getContractError(error as BaseError, {
                    abi: ERC20ABI,
                    address: tokenAddress,
                    args: [owner, spender],
                    functionName: "allowance",
               });
          }
     }

     public static encodeSmartRouterTrade(args: [UserOp[], Hex, Address, bigint], to: Address) {
          const { encodedSelector, encodedInput } = encodeOperation(OperationType.EXEC, args);
          const callData = encodedSelector.concat(encodedInput.substring(2)) as Hex;
          return { to, amount: 0n, data: callData };
     }

     public static async getUserSmartWalletDetails(userAddress: Address, chainId: ChainId) {
          const publicClient = getPublicClient({ chainId });
          const factory = getSmartWalletFactory(chainId);
          const address = await factory.read.walletAddress([userAddress, BigInt(0)]);

          const code = await publicClient.getBytecode({ address });
          const smartWallet = getSmartWallet(chainId, address);
          const nonce = code !== "0x" ? await smartWallet.read.nonce() : BigInt(0);
          return { address, nonce, wallet: smartWallet };
     }
}
