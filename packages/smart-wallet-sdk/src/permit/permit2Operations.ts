import type { Permit2Signature } from "@pancakeswap/universal-router-sdk";
import type { Address } from "viem";
import { OperationType, type WalletOperationBuilder } from "../encoder/walletOperations";

export type ApproveProtocol = {
     token: string;
     protocol: string;
};

export type Permit2TransferFrom = {
     token: string;
     amount: string;
     recipient?: string;
};

export type InputTokenOptions = {
     approval?: ApproveProtocol;
     permit2Permit?: Permit2Signature;
     permit2TransferFrom?: Permit2TransferFrom;
};

export function encodePermit(planner: WalletOperationBuilder, permit2: Permit2Signature, contract: Address): void {
     planner.addUserOperation(OperationType.PERMIT2_PERMIT, [permit2.details, permit2.signature], contract);
}
