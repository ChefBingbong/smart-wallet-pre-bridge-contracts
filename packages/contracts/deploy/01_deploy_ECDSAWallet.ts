import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { DeployFunction } from "hardhat-deploy/types";
import { shouldVerifyContract } from "../utils/deploy";
import { verify } from "../scripts/utils/verify";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
     const { deploy, get } = hre.deployments;
     const { deployer } = await hre.getNamedAccounts();
     const smartWallet = await get("SmartWalletFactory");

     console.log("deployer Address", deployer);
     console.log("smart wallet Address", smartWallet.address);

     const res = await deploy("ECDSAWalletFactory", {
          from: deployer,
          args: [smartWallet.address],
          log: true,
          skipIfAlreadyDeployed: false,
          deterministicDeployment: "0x000019",
     });

     console.log("ECDSAWalletFactory Address", res.address);
     console.log("checking if contracct should be verified");

     //      const shouldVerify = await shouldVerifyContract(res);
     //      if (shouldVerify) {
     //           console.log("verifyng contract...");

     //           await verify({
     //                name: "ECDSAWalletFactory",
     //                path: "contracts/ECDSAWalletFactory.sol:ECDSAWalletFactory",
     //           });
     //           console.log("sucessuflly verified ECDSAWalletFactory");
     //      }
     //      console.log("contract does not need t be verified");
};
export default func;

func.tags = ["ECDSAWalletFactory"];
