import chalk from "chalk";
import hre from "hardhat";
import { ECDSAWalletFactory__factory } from "../typechain-types";
import { JsonRpcProvider } from "@ethersproject/providers";
import type { HttpNetworkConfig } from "hardhat/types";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
     const { getNamedAccounts, deployments } = hre;
     const { get } = deployments;
     const { user } = await getNamedAccounts();

     const provider = new JsonRpcProvider(hre.config.networks[hre.network.name] as HttpNetworkConfig);
     const signers = hre.network.config.accounts as string[];

     console.log(chalk.yellow("Setting up Contracts and Network Config", user));
     await sleep(3000);

     const userWalletSigner = new hre.ethers.Wallet(signers[1], provider);
     const smartWalletSigner = new hre.ethers.Wallet(signers[0], provider);

     const factory = await get("ECDSAWalletFactory");
     const smartWalletFactory = ECDSAWalletFactory__factory.connect(factory.address, smartWalletSigner);

     const userSmartWalletAddress = await smartWalletFactory.connect(userWalletSigner).walletAddress(user, BigInt(0));
     const userWalletContractCode = await provider.getCode(userSmartWalletAddress);

     if (userWalletContractCode === "0x") {
          console.log(
               // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
               chalk.yellow(`Wallet Not deployed yet. initiating creation Tx.`),
          );
          await sleep(2000);

          const value = 1.5 * 10 ** 9;

          if (!value) {
               console.log(
                    chalk.red(
                         `The relayer needs to be funded on wallet creation to
                              fund the deployement cost. please add relayer fee param!`,
                    ),
               );
               return;
          }
          try {
               const tx = await smartWalletFactory.populateTransaction.createWallet(user, { value });
               const creationTx = await smartWalletSigner.sendTransaction(tx);
               const receipt = await creationTx.wait(1);

               console.log(
                    chalk.yellow(
                         `Successfully deployed user Smart Wallet at tx: ${receipt.transactionHash}\n,
                   at address ${userSmartWalletAddress} `,
                    ),
               );
               return;
          } catch (error) {
               console.log(chalk.red("Transaction failed at the create wallet function execution"), error);
               throw new Error(parseContractError(error));
          }
     }
     console.log(chalk.yellow("Smart wallet already deployed"));
}

function parseContractError<T>(err: T): string {
     return (
          err as {
               reason: string;
          }
     ).reason;
}

main().catch((error) => {
     console.error(error);
     process.exitCode = 1;
});
