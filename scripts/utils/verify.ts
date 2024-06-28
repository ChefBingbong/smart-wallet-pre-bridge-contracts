import { deployments } from "hardhat";
import { run } from "hardhat";

export async function verify({ name, path }: { name: string; path: string }) {
     const contract = await deployments.getOrNull(name);
     if (!contract?.address) {
          console.log("contract has no address.");
          return;
     }
     try {
          await run("verify:verify", {
               address: contract.address,
               constructorArguments: contract.args,
               contract: path,
          });
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
     } catch (e: any) {
          if ("message" in e && e instanceof Error && e.message.toLowerCase().includes("already verified")) {
               throw e;
          }
     }
}
