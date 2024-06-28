import type { Address } from "viem";
import type { UserOp } from "../types/smartWallet";
import type { TypedSmartWalletData } from "../types/eip712";

export const typedMetaTx = (
     userOps: UserOp[],
     nonce: bigint,
     smartWalletAddress: Address,
     chainId: number,
): TypedSmartWalletData => {
     const domain = {
          name: "ECDSAWallet",
          version: "0.0.1",
          chainId: chainId,
          verifyingContract: smartWalletAddress,
     };

     const types = {
          UserOp: [
               { name: "to", type: "address" },
               { name: "amount", type: "uint256" },
               { name: "data", type: "bytes" },
          ],
          ECDSAExec: [
               { name: "userOps", type: "UserOp[]" },
               { name: "nonce", type: "uint256" },
               { name: "chainID", type: "uint256" },
               { name: "sigChainID", type: "uint256" },
          ],
     };
     const values = {
          userOps: userOps,
          nonce: nonce,
          chainID: chainId,
          sigChainID: chainId,
     };

     return { domain, types, values };
};
