import { defaultAbiCoder } from "@ethersproject/abi";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { Wallet } from "ethers";
import type { AllowanceOp, UserOp } from "./types";

export const sign = async (
  userOps: UserOp[],
  allowanceOp: AllowanceOp,
  nonce: bigint,
  account: SignerWithAddress | Wallet,
  chainId: number,
  verifyingContract: string,
) => {
  const domain = {
    name: "ECDSAWallet",
    version: "0.0.1",
    chainId: chainId,
    verifyingContract,
  };

  const types = {
    AllowanceOp: [
      { name: "details", type: "AllowanceOpDetails[]" },
      { name: "spender", type: "address" },
      { name: "sigDeadline", type: "uint256" },
    ],
    AllowanceOpDetails: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint160" },
      { name: "expiration", type: "uint48" },
      { name: "nonce", type: "uint48" },
    ],
    UserOp: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    ECDSAExec: [
      { name: "allowanceOp", type: "AllowanceOp" },
      { name: "userOps", type: "UserOp[]" },
      { name: "nonce", type: "uint256" },
      { name: "chainID", type: "uint256" },
      { name: "sigChainID", type: "uint256" },
    ],
  };
  const values = {
    allowanceOp: allowanceOp,
    userOps: userOps,
    nonce,
    chainID: chainId,
    sigChainID: chainId,
  };

  const signature = await account._signTypedData(domain, types, values);
  const sig = defaultAbiCoder.encode(
    ["uint256", "bytes"],
    [chainId, signature],
  );

  return { signature: sig, values };
};
