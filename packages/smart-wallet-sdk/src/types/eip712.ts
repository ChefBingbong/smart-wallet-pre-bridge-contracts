import type { Address } from "viem";
import type { UserOp } from "./smartWallet";

export type DomainType = {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: Address;
};

export type Types = {
      name: string;
      type: string;
};

export type ECDSAExecType = {
      userOps: UserOp[];
      nonce: bigint;
      chainID: number;
      sigChainID: number;
};

export type EIP712TypedData = {
      domain: DomainType;
      types: { UserOp: Types[]; ECDSAExec: Types[] };
      values: ECDSAExecType;
};

export type TypedSmartWalletData = {
      domain: DomainType;
      types: { UserOp: Types[]; ECDSAExec: Types[] };
      values: ECDSAExecType;
};
