import { JsonRpcProvider, type TransactionReceipt } from "@ethersproject/providers";
import {
     MaxAllowanceTransferAmount,
     PERMIT_EXPIRATION,
     PERMIT_SIG_EXPIRATION,
     toDeadline,
} from "@pancakeswap/permit2-sdk";
import { CurrencyAmount, ERC20Token, Percent, TradeType, type ChainId } from "@pancakeswap/sdk";
import { SMART_ROUTER_ADDRESSES, SmartRouter, SwapRouter, type SmartRouterTrade } from "@pancakeswap/smart-router";
import chalk from "chalk";
import type { PopulatedTransaction, ethers } from "ethers";
import hre from "hardhat";
import type { HttpNetworkConfig } from "hardhat/types";
import { formatUnits, hexToBigInt, maxUint256, type Address } from "viem";
import { bscTestnet } from "viem/chains";
import { sign } from "../utils/sign";
import { ECDSAWalletFactory__factory, ECDSAWallet__factory, ERC20__factory } from "../typechain-types";
import { Deployments } from "../utils/deploymentUtils";
import { sleep } from "./deploySmartWallet";
import { getClient, v2SubgraphClient, v3SubgraphClient } from "./utils/client";
import type { UserOp, AllowanceOp } from "../utils/types";

async function main(config: ScriptConfig) {
     const chainId = await hre.getChainId();
     const { getNamedAccounts, deployments, network } = hre;
     const { get } = deployments;
     const { deployer, user } = await getNamedAccounts();

     const provider = new JsonRpcProvider(hre.config.networks[hre.network.name] as HttpNetworkConfig);
     const smartRouterClient = getClient(bscTestnet); // ned t manually add
     const signers = hre.network.config.accounts as string[];

     console.log(chalk.yellow("Setting up Contracts and Network Config", user));
     await sleep(1500);

     const userWalletSigner = new hre.ethers.Wallet(signers[1], provider);
     const smartWalletSigner = new hre.ethers.Wallet(signers[0], provider);

     const factory = await get("ECDSAWalletFactory");
     const smartWalletFactory = ECDSAWalletFactory__factory.connect(factory.address, smartWalletSigner);

     const userSmartWalletAddress = await smartWalletFactory.connect(userWalletSigner).walletAddress(user, BigInt(0));
     const userSmartWallet = ECDSAWallet__factory.connect(userSmartWalletAddress, provider);

     const userWalletContractCode = await provider.getCode(userSmartWalletAddress);
     if (userWalletContractCode === "0x") {
          console.log(
               chalk.yellow(
                    `Smart wallet not deployed for ${userWalletSigner.address}, please run deloySmartWallet.ts`,
               ),
          );
          return;
     }

     const CakeContract = ERC20__factory.connect(Deployments[Number(chainId) as ChainId].Cake, provider);
     const BusdContract = ERC20__factory.connect(Deployments[Number(chainId) as ChainId].Busd, provider);

     const CAKE = new ERC20Token(
          Number(chainId),
          CakeContract.address as Address,
          await CakeContract.decimals(),
          await CakeContract.symbol(),
     );
     const BUSD = new ERC20Token(
          Number(chainId),
          BusdContract.address as Address,
          await BusdContract.decimals(),
          await BusdContract.symbol(),
     );

     const baseAsset = config.baseAsset === CAKE.symbol ? CAKE : BUSD;
     const quoteAsset = config.quoteAsset === CAKE.symbol ? CAKE : BUSD;
     const feeAsset = config.feeAsset === CAKE.symbol ? CAKE : BUSD;
     const amountIn = CurrencyAmount.fromRawAmount(baseAsset, config.amountIn);

     const [userCakeBalanceBefore, deployerCakeBalanceBefore, userBusdBalanceBefore, deployerBusdBalanceBefore] =
          await Promise.all([
               CakeContract.balanceOf(user),
               CakeContract.balanceOf(deployer),
               BusdContract.balanceOf(user),
               BusdContract.balanceOf(deployer),
          ]);
     console.log(
          chalk.yellow(
               `\nSwapping from CAKE to BUSD on ${network.name} network.
            User CAKE balance: ${formatBalance(userCakeBalanceBefore)},
            Relayer CAKE balance: ${formatBalance(deployerCakeBalanceBefore)}
            User BUSD balance: ${formatBalance(userBusdBalanceBefore)},
            Relayer BUSD balance: ${formatBalance(deployerBusdBalanceBefore)}
            Proceeding to Build Permit tx\n\n`,
          ),
     );
     await sleep(1000);

     const permit2Address = userSmartWalletAddress as Address;
     if ((await BusdContract.allowance(user, permit2Address)).toBigInt() < amountIn.quotient) {
          console.log(chalk.yellow("Making One time approval for CAKE..."));
          const busdApproval = await BusdContract.connect(userWalletSigner).approve(permit2Address, maxUint256);
          await busdApproval.wait(1);
     }
     if ((await CakeContract.allowance(user, permit2Address)).toBigInt() < amountIn.quotient) {
          console.log(chalk.yellow("Making One time approval for BUSD..."));
          const cakeApproval = await CakeContract.connect(userWalletSigner).approve(permit2Address, maxUint256);
          await cakeApproval.wait(1);
     }

     const allowance = await userSmartWallet.allowance(user, baseAsset.address, userSmartWalletAddress);
     const permitDetails: AllowanceOp = {
          details: [
               {
                    token: baseAsset.address,
                    amount: MaxAllowanceTransferAmount,
                    expiration: BigInt(toDeadline(PERMIT_EXPIRATION)),
                    nonce: BigInt(allowance.nonce),
               },
               // second permit is always for fee
               {
                    token: feeAsset.address,
                    amount: MaxAllowanceTransferAmount,
                    expiration: BigInt(toDeadline(PERMIT_EXPIRATION)),
                    nonce: BigInt(allowance.nonce + 1), // only increment if both permits are same asset
               },
          ],
          spender: permit2Address,
          sigDeadline: BigInt(toDeadline(PERMIT_SIG_EXPIRATION)),
     };

     const gasPrice = (await provider.getGasPrice()).toBigInt();
     let transferToWalletTx: PopulatedTransaction;
     try {
          transferToWalletTx = await userSmartWallet
               .connect(smartWalletSigner)
               .populateTransaction.transferFrom(user, permit2Address, amountIn.quotient, baseAsset.address, {
                    gasLimit: 35000,
                    gasPrice,
               });
     } catch (error) {
          console.log(chalk.red("Transaction failed at the permit transfer step"));
          throw new Error(parseContractError(error));
     }

     console.log(chalk.yellow("Permit transfer build successfully,..Proceeding to build V3 smart router trade\n\n"));
     await sleep(1000);

     const quoteProvider = SmartRouter.createQuoteProvider({
          onChainProvider: () => smartRouterClient as never,
     });

     let bestTradeRoute: SmartRouterTrade<TradeType>;
     try {
          const [v2Pools, v3Pools] = await Promise.all([
               SmartRouter.getV2CandidatePools({
                    onChainProvider: () => smartRouterClient,
                    v2SubgraphProvider: () => v2SubgraphClient,
                    v3SubgraphProvider: () => v3SubgraphClient,
                    currencyA: CAKE,
                    currencyB: BUSD,
               } as never),
               SmartRouter.getV3CandidatePools({
                    onChainProvider: () => smartRouterClient,
                    subgraphProvider: () => v3SubgraphClient,
                    currencyA: CAKE,
                    currencyB: BUSD,
                    subgraphFallback: false,
               } as never),
          ]);
          const pools = [...v2Pools, ...v3Pools];

          bestTradeRoute = (await SmartRouter.getBestTrade(amountIn, BUSD, TradeType.EXACT_INPUT, {
               gasPriceWei: gasPrice,
               maxHops: 2,
               maxSplits: 2,
               poolProvider: SmartRouter.createStaticPoolProvider(pools),
               quoteProvider,
               quoterOptimization: true,
          })) as SmartRouterTrade<TradeType>;
     } catch (error) {
          console.log(chalk.red("Transaction failed at the smart router build step"), error);
          throw new Error(parseContractError(error));
     }

     console.log(
          chalk.yellow("V3 Trade built successfully,..Proceeding to build and execute Smart Wallet Operations\n\n"),
     );
     await sleep(1000);

     const routerAddress = SMART_ROUTER_ADDRESSES[Number(chainId) as ChainId];
     const rawApprovalTx = await CakeContract.connect(smartWalletSigner).populateTransaction.approve(
          routerAddress,
          amountIn.quotient,
     );

     const rawV3TradeTx = SwapRouter.swapCallParameters(bestTradeRoute, {
          recipient: user as Address,
          slippageTolerance: new Percent(1),
     });
     const smartWalletOperations = [
          {
               to: transferToWalletTx.to,
               amount: BigInt(0),
               data: transferToWalletTx.data,
          },
          {
               to: rawApprovalTx.to,
               amount: BigInt(0),
               data: rawApprovalTx.data,
          },
          {
               to: routerAddress,
               amount: hexToBigInt(rawV3TradeTx.value),
               data: rawV3TradeTx.calldata,
          },
     ] as UserOp[];

     const currentWalletTxNonce = await userSmartWallet?.nonce();
     const smartWalletSignature = await sign(
          smartWalletOperations,
          permitDetails,
          currentWalletTxNonce.toBigInt(),
          userWalletSigner,
          Number(chainId),
          userSmartWalletAddress,
     );

     let smartWalletTxReceipt: TransactionReceipt;
     try {
          const smartWallTxGas = await userSmartWallet
               .connect(smartWalletSigner)
               .estimateGas.exec(smartWalletOperations, permitDetails, smartWalletSignature.signature);

          const rawSmartWalletTx = await userSmartWallet
               .connect(smartWalletSigner)
               .populateTransaction.exec(smartWalletOperations, permitDetails, smartWalletSignature.signature, {
                    gasLimit: smartWallTxGas,
                    gasPrice,
               });

          const deployerTransaction = await smartWalletSigner.sendTransaction(rawSmartWalletTx);
          smartWalletTxReceipt = await deployerTransaction.wait(1);
     } catch (error) {
          console.log(chalk.red("Transaction failed at the smart router build step"), error);
          throw new Error(parseContractError(error));
     }

     const [userCakeBalanceAfter, deployerCakeBalanceAfter, userBusdBalanceAfter, deployerBusdBalanceAfter] =
          await Promise.all([
               CakeContract.balanceOf(user),
               CakeContract.balanceOf(deployer),
               BusdContract.balanceOf(user),
               BusdContract.balanceOf(deployer),
          ]);
     console.log(
          chalk.green(
               `\nSuccessfully swaped from 5 CAKE to BUSD on ${network.name} network\n.
            User CAKE balance before/after: ${formatBalance(userCakeBalanceBefore)} / ${formatBalance(userCakeBalanceAfter)},
            Relayer CAKE balance before/after: ${formatBalance(deployerCakeBalanceBefore)} / ${formatBalance(deployerCakeBalanceAfter)}
            User BUSD balance before/after: ${formatBalance(userBusdBalanceBefore)} / ${formatBalance(userCakeBalanceAfter)},
            Relayer BUSD balance before/after: ${formatBalance(deployerBusdBalanceBefore)} / ${formatBalance(deployerBusdBalanceAfter)}
            \nTransaction Hash: ${smartWalletTxReceipt.transactionHash}\n\n`,
          ),
     );
}

const formatBalance = (b: ethers.BigNumber) => Number(formatUnits(b.toBigInt(), 18)).toFixed(3);
type ScriptConfig = { baseAsset: string; quoteAsset: string; feeAsset: string; amountIn: bigint };

function parseContractError<T>(err: T): string {
     return (
          err as {
               reason: string;
          }
     ).reason;
}

main({
     baseAsset: "CAKE",
     quoteAsset: "BUSD",
     feeAsset: "CAKE",
     amountIn: BigInt(1 * 10 ** 18),
}).catch((error) => {
     console.error(error);
     process.exitCode = 1;
});
