// import {
//   type ChainId,
//   type Currency,
//   CurrencyAmount,
//   Percent,
//   TradeType,
// } from "@pancakeswap/sdk";
// import { SmartRouter } from "@pancakeswap/smart-router";

// // import type { UserOp } from "@smart-wallet/router-sdk/types";
// import { defaultAbiCoder } from "@ethersproject/abi";
// import { getPermit2Address } from "@pancakeswap/permit2-sdk";
// import { CopyIcon } from "@pancakeswap/uikit";
// import { SmartWalletRouter } from "@smart-wallet/router-sdk";
// import { useQuery } from "@tanstack/react-query";
// // import { getIsNetworkEnabled } from "../constants";
// import {
//   HydrationBoundary,
//   QueryClient,
//   QueryClientProvider,
// } from "@tanstack/react-query";
// import type React from "react";
// import {
//   useCallback,
//   useDeferredValue,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import styled, { css, keyframes } from "styled-components";
// import {
//   type TransactionReceipt,
//   TransactionRejectedRpcError,
//   UserRejectedRequestError,
// } from "viem";
// import {
//   WagmiConfig,
//   useAccount,
//   useChainId,
//   useConnect,
//   useDisconnect,
//   useNetwork,
//   useSendTransaction,
//   useSignTypedData,
//   useSwitchNetwork,
//   useWalletClient,
// } from "wagmi";
// import { useTokenBalance } from "~/components/Transfer";
// import { ChainsAdapter, allChains } from "~/config/chains";
// import {
//   getViemClient,
//   v2SubgraphClient,
//   v3SubgraphClient,
// } from "~/config/client";
// import { config } from "~/config/wagmiConfig";
// import useDebounce from "~/hooks/useDebounce";
// import { type Asset, assets, assetsBaseConfig } from "~/lib/assets";

// const dummyTransaction = {
//   blockNumber: undefined,
//   contractAddress: undefined,
//   cumulativeGasUsed: undefined,
//   effectiveGasPrice: undefined,
//   from: undefined,
//   gasUsed: undefined,
//   status: undefined,
//   to: "0x00000000000000000000000000000000",
//   logs: undefined,
//   logsBloom: undefined,
//   transactionHash:
//     "0x000000000000000000000000000000000x00000000000000000000000000000000",
//   transactionIndex: undefined,
//   type: undefined,
// };

// const TransactionCard = ({
//   transaction,
// }: {
//   transaction: TransactionReceipt;
// }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleAccordion = () => {
//     setIsOpen(!isOpen);
//   };

//   const t = transaction ?? dummyTransaction;

//   const { from, to, status, gasUsed, transactionHash, ...rest } = t;

//   return (
//     <div
//       className={`my-2 rounded-md bg-gray-100 px-4 focus-within:bg-gray-200 ${isOpen ? "open" : "closed"}`}
//     >
//       {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
//       <div
//         className="flex cursor-pointer items-center justify-between px-4 py-2"
//         onClick={toggleAccordion}
//       >
//         <div className="font-bold">Transaction Details</div>
//         <div className="text-gray-500">{isOpen ? "▼" : "►"}</div>
//       </div>

//       {[1, 2, 3, 4].map((v) => {
//         return (
//           <div
//             className="m-4 rounded-sm border border-solid border-gray-400 px-2"
//             key={v}
//           >
//             {Object.entries([from, to, status, gasUsed, transactionHash]).map(
//               ([key, value], index) => (
//                 <div key={index} className="mb-2 flex">
//                   <div className="w-1/3 font-bold">{key}</div>
//                   <div className="w-2/3 overflow-ellipsis">
//                     {value?.toString()}
//                   </div>
//                 </div>
//               ),
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// function calculateGasMargin(value: bigint, margin = 1000n): bigint {
//   return (value * (10000n + margin)) / 10000n;
// }

// export const StyledSVG = styled.svg<{
//   size: string;
//   stroke?: string;
//   fill?: string;
// }>`
//   height: ${({ size }) => size};
//   width: ${({ size }) => size};
//   path {
//     stroke: ${({ stroke }) => stroke};
//     background: grey;
//     fill: ${({ fill }) => fill};
//   }
// `;

// const rotateAnimation = keyframes`
//       from {
//         transform: rotate(0deg);
//       }
//       to {
//         transform: rotate(360deg);
//       }
//     `;

// export const RotationStyle = css`
//   animation: 2s ${rotateAnimation} linear infinite;
// `;

// export const StyledRotatingSVG = styled(StyledSVG)`
//   ${RotationStyle}
// `;

// export function LoaderV3({
//   size = "4px",
//   ...rest
// }: {
//   size?: string;
//   [k: string]: any;
// }) {
//   return (
//     <StyledRotatingSVG
//       size={size}
//       viewBox="0 0 54 54"
//       xmlns="http://www.w3.org/2000/svg"
//       fill="bg-gray-200"
//       stroke="bg-gray-200"
//       strokeWidth={0.1}
//       {...rest}
//     >
//       <path
//         opacity="0.1"
//         d="M53.6666 26.9999C53.6666 41.7275 41.7276 53.6666 27 53.6666C12.2724 53.6666 0.333313 41.7275 0.333313 26.9999C0.333313 12.2723 12.2724 0.333252 27 0.333252C41.7276 0.333252 53.6666 12.2723 53.6666 26.9999ZM8.33331 26.9999C8.33331 37.3092 16.6907 45.6666 27 45.6666C37.3093 45.6666 45.6666 37.3092 45.6666 26.9999C45.6666 16.6906 37.3093 8.33325 27 8.33325C16.6907 8.33325 8.33331 16.6906 8.33331 26.9999Z"
//         fill="bg-gray-200"
//       />
//       <path
//         d="M49.6666 26.9999C51.8758 26.9999 53.6973 25.1992 53.3672 23.0149C53.0452 20.884 52.4652 18.7951 51.6368 16.795C50.2966 13.5597 48.3324 10.62 45.8562 8.14374C43.3799 5.66751 40.4402 3.70326 37.2049 2.36313C35.2048 1.53466 33.1159 0.954747 30.985 0.632693C28.8007 0.30256 27 2.12411 27 4.33325C27 6.54239 28.8108 8.29042 30.9695 8.76019C32.0523 8.99585 33.1146 9.32804 34.1434 9.75417C36.4081 10.6923 38.4659 12.0672 40.1993 13.8006C41.9327 15.534 43.3076 17.5918 44.2457 19.8565C44.6719 20.8853 45.004 21.9476 45.2397 23.0304C45.7095 25.1891 47.4575 26.9999 49.6666 26.9999Z"
//         fill="bg-gray-200"
//       />
//     </StyledRotatingSVG>
//   );
// }

// export default function SmartRouterExample() {
//   const { chain: currenChain } = useNetwork();
//   const chainId = useChainId() as ChainId;
//   const { address, isConnected } = useAccount();
//   const { connect, connectors } = useConnect();
//   const { switchNetwork } = useSwitchNetwork();
//   const { sendTransactionAsync } = useSendTransaction();
//   const { signTypedDataAsync } = useSignTypedData();
//   const { disconnect } = useDisconnect();
//   const publicClient = getViemClient({ chainId });
//   const walletClient = useWalletClient({ chainId });
//   const [tx, setTx] = useState<TransactionReceipt | undefined>(undefined);
//   const [inputValue, setInputValue] = useState("");
//   const [pending, setPending] = useState<boolean>(false);
//   const [asset, setAsset] = useState<Currency>(assetsBaseConfig.CAKE);
//   const [toAsset, setToAsset] = useState<Currency>(assetsBaseConfig.BUSD);
//   const [feeAsset, setFeeAsset] = useState<Currency>(assetsBaseConfig.BUSD);

//   const [chain, setChain] = useState(
//     ChainsAdapter[asset.chainId as ChainId].name,
//   );
//   const amount = useMemo(
//     () =>
//       CurrencyAmount.fromRawAmount(
//         asset,
//         Number(inputValue) * 10 ** asset.decimals,
//       ),
//     [asset, inputValue],
//   );

//   const deferQuotientRaw = useDeferredValue(amount.quotient.toString());
//   const deferQuotient = useDebounce(deferQuotientRaw, 500);
//   const balance = useTokenBalance(asset.wrapped.address);
//   const balance2 = useTokenBalance(toAsset.wrapped.address);

//   const handleAsset = useCallback(
//     (e: React.ChangeEvent<HTMLSelectElement>) => {
//       const newAsset = assetsBaseConfig[e.target.value as Asset];
//       setAsset(newAsset);
//     },
//     [setAsset],
//   );

//   const handleToAsset = useCallback(
//     (e: React.ChangeEvent<HTMLSelectElement>) => {
//       const newAsset = assetsBaseConfig[e.target.value as Asset];
//       setToAsset(newAsset);
//     },
//     [setToAsset],
//   );

//   const handleChain = useCallback(
//     (e: React.ChangeEvent<HTMLSelectElement>) => {
//       const newChainId = e.target.value;
//       const newChain = allChains.find((c) => c.name === newChainId);
//       setChain(newChain?.name ?? chain);
//     },
//     [chain],
//   );

//   const handleAmount = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(e.target.value);
//   }, []);

//   const { data: smartWalletDetails } = useQuery({
//     queryKey: ["smartWalletDetails", address, chainId],
//     queryFn: async () => {
//       if (!address || !chainId) throw new Error("No smart wallet");
//       return await SmartWalletRouter.getUserSmartWalletDetails(
//         address,
//         chainId,
//       );
//     },
//     retry: false,
//     refetchOnWindowFocus: false,
//     enabled: Boolean(address && chainId),
//   });

//   // console.log(smartWalletDetails);
//   const { data: allowance } = useQuery({
//     queryKey: [chainId, asset?.wrapped.address, address, chainId],
//     queryFn: async () => {
//       if (!asset || !chainId || !address || !smartWalletDetails || !amount)
//         throw new Error("No token");

//       const wallet = smartWalletDetails?.address;
//       const permit2 = getPermit2Address(chainId);

//       // eslint-disable-next-line @typescript-eslint/unbound-method
//       const getAllowance = SmartWalletRouter.getContractAllowance;

//       const [permit2Allowances, smartWalletAllowances] = await Promise.all([
//         getAllowance(
//           asset.wrapped.address,
//           address,
//           permit2,
//           chainId,
//           amount.quotient,
//         ),
//         getAllowance(
//           asset.wrapped.address,
//           address,
//           wallet,
//           chainId,
//           amount.quotient,
//         ),
//       ]);
//       return { permit2Allowances, smartWalletAllowances };
//     },

//     refetchInterval: 20000,
//     retry: false,
//     refetchOnWindowFocus: false,
//     enabled: Boolean(
//       address && asset && chainId && smartWalletDetails && amount,
//     ),
//   });

//   const {
//     data: trade,
//     isLoading,
//     isFetching,
//     isPlaceholderData,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: [
//       toAsset?.chainId,
//       amount?.currency?.symbol,
//       toAsset?.symbol,
//       deferQuotient,
//     ],
//     queryFn: async () => {
//       if (!amount?.currency || !toAsset || !deferQuotient) {
//         return undefined;
//       }
//       const quoteProvider = SmartRouter.createQuoteProvider({
//         onChainProvider: () => publicClient,
//       });

//       const [v2Pools, v3Pools] = await Promise.all([
//         SmartRouter.getV2CandidatePools({
//           onChainProvider: () => publicClient,
//           v2SubgraphProvider: () => v2SubgraphClient,
//           v3SubgraphProvider: () => v3SubgraphClient,
//           currencyA: amount.currency,
//           currencyB: toAsset,
//         }),
//         SmartRouter.getV3CandidatePools({
//           onChainProvider: () => publicClient,
//           subgraphProvider: () => v3SubgraphClient,
//           currencyA: amount.currency,
//           currencyB: toAsset,
//           subgraphFallback: false,
//         }),
//       ]);
//       const pools = [...v2Pools, ...v3Pools];

//       const deferAmount = CurrencyAmount.fromRawAmount(
//         amount.currency,
//         deferQuotient,
//       );
//       const res = await SmartRouter.getBestTrade(
//         deferAmount,
//         toAsset,
//         TradeType.EXACT_INPUT,
//         {
//           gasPriceWei: await publicClient.getGasPrice(),
//           maxHops: 2,
//           maxSplits: 2,
//           poolProvider: SmartRouter.createStaticPoolProvider(pools),
//           quoteProvider,
//           quoterOptimization: true,
//         },
//       );

//       if (!res) return undefined;
//       return res;
//     },
//     enabled: !!(amount && toAsset && deferQuotient),
//     refetchOnWindowFocus: false,
//     retry: false,
//     staleTime: 15000,
//     refetchInterval: 15000,
//   });

//   const swapCallParams = useMemo(() => {
//     if (!trade || !chainId || !allowance || !smartWalletDetails) return null;

//     const options = {
//       account: address,
//       chainId,
//       smartWalletDetails,
//       SmartWalletTradeType: "SmartWalletTrade",
//       router: "SmartRouter",
//       hasApprovedPermit2: allowance.permit2Allowances.needsApproval,
//       hasApprovedRelayer: allowance.smartWalletAllowances.needsApproval,
//       walletPermitOptions: undefined,
//       underlyingTradeOptions: {
//         recipient: address,
//         slippageTolerance: new Percent(1),
//       },
//     };
//     const {
//       permitDetails,
//       smartWalletDetails: ops,
//       externalUserOps,
//     } = SmartWalletRouter.buildSmartWalletTrade(trade, options);
//     return {
//       externalUserOps,
//       ops,
//       permitDetails,
//     };
//   }, [trade, address, chainId, allowance, smartWalletDetails]);

//   const { data: fees } = useQuery({
//     queryKey: ["fees", chainId, swapCallParams, trade],
//     queryFn: async () => {
//       if (!swapCallParams || !chainId || !trade) throw new Error("No token");
//       return SmartWalletRouter.estimateSmartWalletFees({
//         userOps: swapCallParams?.ops,
//         trade,
//         chainId,
//       });
//     },

//     refetchInterval: 20000,
//     retry: false,
//     refetchOnWindowFocus: false,
//     enabled: Boolean(swapCallParams && trade && chainId),
//   });

//   console.log(swapCallParams, "calllll");
//   console.log(allowance);
//   console.log(fees);
//   const swap = useCallback(async () => {
//     if (!swapCallParams || !address || !allowance) return;
//     setPending(true);
//     setTx(undefined);
//     const windowClient = await config.connector?.getWalletClient();
//     const externalOps = swapCallParams.externalUserOps as UserOp[];
//     for (const externalOp of externalOps) {
//       await SmartWalletRouter.sendTransactionFromRelayer(chainId, externalOp, {
//         externalClient: windowClient,
//       });
//     }
//     const { domain, types, values } = swapCallParams.ops;
//     await signTypedDataAsync({
//       account: address,
//       domain,
//       types,
//       message: values,
//       primaryType: "ECDSAExec",
//     })
//       .then(async (signature) => {
//         const signatureEncoded = defaultAbiCoder.encode(
//           ["uint256", "bytes"],
//           [97, signature],
//         );

//         const tradeArgs = [values.userOps, signatureEncoded];
//         const tradeEncoded = SmartWalletRouter.encodeSmartRouterTrade(
//           tradeArgs,
//           smartWalletDetails?.address,
//         );

//         console.log("sww", smartWalletDetails?.address);
//         let response = null;
//         if (
//           (SmartWalletRouter.tradeConfig.tradeType as unknown as string) !==
//           "SmartWalletTrade"
//         ) {
//           response = await SmartWalletRouter.sendTransactionFromRelayer(
//             chainId,
//             tradeEncoded,
//           );
//         } else {
//           response = await SmartWalletRouter.sendTransactionFromRelayer(
//             chainId,
//             tradeEncoded,
//             {
//               externalClient: windowClient,
//             },
//           );
//         }
//         setPending(false);
//         setTx(response);
//         return response as TransactionReceipt;
//       })
//       .catch((err: unknown) => {
//         setPending(false);
//         if (err instanceof UserRejectedRequestError) {
//           throw new TransactionRejectedRpcError(t("Transaction rejected"));
//         }
//         throw new Error(`Swap Failed ${err}`);
//       });
//   }, [
//     swapCallParams,
//     address,
//     signTypedDataAsync,
//     chainId,
//     allowance,
//     smartWalletDetails,
//   ]);

//   useEffect(() => {
//     if (isConnected && currenChain?.id !== chainId) {
//       switchNetwork?.(chainId);
//     }
//   }, [isConnected, switchNetwork, currenChain, chainId]);

//   return (
//     <div className="grid h-screen place-items-center">
//       {!address ? (
//         // biome-ignore lint/a11y/useButtonType: <explanation>
//         <button
//           className="rounded-md bg-indigo-600 px-10 py-4 font-medium text-white hover:bg-indigo-700"
//           onClick={() => connect({ connector: connectors[0] })}
//         >
//           {!isConnected ? "Connecting..." : "Connect Wallet"}
//         </button>
//       ) : (
//         <div className="w-[1000px] ">
//           <div className="mx-auto my-0 w-[60%]">
//             <span className="font-medium text-gray-700">
//               Your Wallet Address
//             </span>
//             <div className="mt-1 flex">
//               <span className="flex  h-14 items-center justify-between rounded-md bg-gray-100 px-6">
//                 {address}
//                 <CopyIcon
//                   className="ml-2 hover:cursor-pointer"
//                   onClick={async () => {
//                     await navigator.clipboard.writeText(address as string);
//                   }}
//                 />
//               </span>
//               {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//               <button
//                 className="ml-2 rounded-md bg-indigo-600 px-4 py-4 font-medium text-white hover:bg-indigo-700"
//                 onClick={() => disconnect()}
//               >
//                 Disconnect
//               </button>
//             </div>
//           </div>
//           <div className="mx-auto my-0 w-[60%]">
//             <span className="font-medium text-gray-700">
//               Your Smart Wallet Address
//             </span>
//             <div className="mt-1 flex">
//               <span className="flex  h-14 items-center justify-between rounded-md bg-gray-100 px-6">
//                 {smartWalletDetails?.address}
//                 <CopyIcon
//                   className="ml-2 hover:cursor-pointer"
//                   onClick={async () => {
//                     await navigator.clipboard.writeText(
//                       smartWalletDetails?.address as string,
//                     );
//                   }}
//                 />
//               </span>
//             </div>
//           </div>
//           <div className="mt-8 flex flex-col items-center justify-center">
//             <div className="w-[60%]">
//               <span className="w-full font-medium text-gray-700">
//                 Transfer without gas
//               </span>

//               <div className="relative my-2 flex w-full items-center rounded-md bg-gray-100 focus-within:bg-gray-200">
//                 <select
//                   className="absolute h-14 grow rounded-md bg-transparent pl-6 pr-12 outline-none "
//                   value={asset.symbol}
//                   onChange={handleAsset}
//                 >
//                   {Object.entries(assets).map(([k], i) => {
//                     return <option key={i}>{k}</option>;
//                   })}
//                 </select>
//                 <input
//                   type="number"
//                   className="h-14 grow rounded-md bg-gray-100 px-6 text-right outline-none focus:bg-gray-200"
//                   value={inputValue}
//                   placeholder="enter an amount to swap"
//                   onChange={handleAmount}
//                   required
//                 />
//               </div>
//               <div className="relative my-2 flex w-full items-center rounded-md bg-gray-100 focus-within:bg-gray-200">
//                 <select
//                   className="absolute h-14 grow rounded-md bg-transparent pl-6 pr-12 outline-none "
//                   value={feeAsset.symbol}
//                   onChange={handleToAsset}
//                 >
//                   {Object.entries(assets).map(([k], i) => {
//                     return <option key={i}>{k}</option>;
//                   })}
//                 </select>
//                 <input
//                   type="number"
//                   className="h-14 flex-1 grow rounded-md bg-gray-100 px-6 text-right outline-none focus:bg-gray-200"
//                   value={trade ? trade?.outputAmount?.toExact() : ""}
//                   placeholder="choose your fee asset"
//                   // onChange={handleAmount}
//                   disabled
//                 />
//               </div>

//               <div className="relative my-2 flex w-full items-center rounded-md bg-gray-100 focus-within:bg-gray-200">
//                 <select
//                   className="absolute h-14 grow rounded-md bg-transparent pl-6 pr-12 outline-none "
//                   value={toAsset.symbol}
//                   onChange={handleToAsset}
//                 >
//                   {Object.entries(assets).map(([k], i) => {
//                     return <option key={i}>{k}</option>;
//                   })}
//                 </select>
//                 <input
//                   type="number"
//                   className="h-14 flex-1 grow rounded-md bg-gray-100 px-6 text-right outline-none focus:bg-gray-200"
//                   value={trade ? trade?.outputAmount?.toExact() : ""}
//                   placeholder="you recieve 0.00"
//                   // onChange={handleAmount}
//                   disabled
//                 />
//               </div>
//               <TransactionCard transaction={tx} />

//               <div className="my-2 flex w-full items-center">
//                 {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//                 <button
//                   className="my-2 w-full rounded-md bg-indigo-600 py-4 font-medium text-white hover:bg-indigo-700"
//                   onClick={swap}
//                   // disabled={pending || isFetching || isLoading}
//                 >
//                   <div className=" flex w-full items-center justify-center">
//                     <p className="mx-2 text-gray-300">
//                       {allowance?.smartWalletAllowances.needsApproval
//                         ? "Swap"
//                         : pending
//                           ? "Processing Transaction"
//                           : "Approve Smart Router"}
//                     </p>
//                     <LoaderV3
//                       opacity={pending || isFetching || isLoading ? 1 : 0}
//                       size="24px"
//                     />
//                   </div>
//                 </button>
//               </div>
//               <p className="mt-1 text-xs font-medium uppercase text-gray-500">{`Max: ${
//                 balance.balance
//                   ? balance.balance.shiftedBy(-asset.decimals).toFixed(5)
//                   : "-"
//               } ${asset.symbol}`}</p>
//               <p className="mt-1 text-xs font-medium uppercase text-gray-500">{`Max: ${
//                 balance2.balance
//                   ? balance2.balance.shiftedBy(-toAsset.decimals).toFixed(5)
//                   : "-"
//               } ${toAsset.symbol}`}</p>
//               <p className="mt-1 text-xs font-medium uppercase text-gray-500">{`sw allowance: ${
//                 allowance?.smartWalletAllowances.allowance ?? 0
//               } ${asset.symbol}`}</p>
//               {/* {error && <p className="font-medium text-red-400 mt-1">{error}</p>} */}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
