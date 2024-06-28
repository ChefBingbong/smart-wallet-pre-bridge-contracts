import type { AbiParametersToPrimitiveTypes } from "abitype";
import {
     encodeAbiParameters,
     parseAbiItem,
     getFunctionSelector as toFunctionSelector,
     type Address,
     type Hex,
} from "viem";
import type { SwapCall, UserOp } from "../types/smartWallet";

export type ABIType = typeof ABI_PARAMETER;
export type OperationUsed = keyof typeof ABI_PARAMETER;
export type ABIParametersType<TOperationType extends OperationUsed> = AbiParametersToPrimitiveTypes<
     ABIType[TOperationType]["inputs"]
>;

export enum OperationType {
     EXEC = "EXEC",
     CREATE_WALLET = "CREATE_WALLET",
     TRANSFER = "TRANSFER",
     TRANSFER_FROM = "TRANSFER_FROM",
     APPROVE = "APPROVE",

     PERMIT2_PERMIT = "PERMIT2_PERMIT",
     PERMIT2_PERMIT_BATCH = "PERMIT2_PERMIT_BATCH",
     PERMIT2_TRANSFER_FROM = "PERMIT2_TRANSFER_FROM",
     PERMIT2_TRANSFER_FROM_BATCH = "PERMIT2_TRANSFER_FROM_BATCH",
     PERMIT2_TRANSFER_TO_RELAYER_WITNESS = "PERMIT2_TRANSFER_TO_RELAYER_WITNESS",
     CLAIM_PERMIT = "CLAIM_PERMIT",
}

const ABI_STRUCT_PERMIT_DETAILS = `
struct PermitDetails {
  address token;
  uint160 amount;
  uint48 expiration;
  uint48 nonce;
}`.replaceAll("\n", "");

const ABI_STRUCT_PERMIT_SINGLE = `
struct PermitSingle {
  PermitDetails details;
  address spender;
  uint256 sigDeadline;
}
`.replaceAll("\n", "");

const ABI_STRUCT_PERMIT_BATCH = `
struct PermitBatch {
  PermitSingle[] details;
  address spender;
  uint256 sigDeadline;
}
`.replaceAll("\n", "");

const ABI_STRUCT_ALLOWANCE_TRANSFER_DETAILS = `
struct AllowanceTransferDetails {
  address from;
  address to;
  uint160 amount;
  address token;
}
`.replaceAll("\n", "");

const ABI_STRUCT_SIGNATURE_TRANSFER_DETAILS = `
struct ISignatureTransfer.PermitTransferFrom {
  TokenPermissions permitted;
  uint256 nonce;
  uint256 deadline;
}

`.replaceAll("\n", "");

export const ABI_PARAMETER = {
     // samrt wallet ops
     [OperationType.CREATE_WALLET]: parseAbiItem("function createWallet(address _owner)"),
     [OperationType.EXEC]: parseAbiItem([
          "function exec(UserOp[] calldata userOps, bytes calldata _signature, address _feeTokenAddress, uint256 _gasPrice)",
          "struct UserOp { address to; uint256 amount; bytes data; }",
     ]),

     // ERC20 ops
     [OperationType.TRANSFER]: parseAbiItem("function transfer(address to, uint256 amount)"),
     [OperationType.TRANSFER_FROM]: parseAbiItem("function transferFrom(address from, address to, uint256 amount)"),
     [OperationType.APPROVE]: parseAbiItem("function approve(address spender, uint256 amount)"),

     // PERMIT OPS
     [OperationType.PERMIT2_PERMIT]: parseAbiItem([
          "function permit2Permit(PermitSingle permitSingle, bytes data)",
          ABI_STRUCT_PERMIT_SINGLE,
          ABI_STRUCT_PERMIT_DETAILS,
     ]),
     [OperationType.PERMIT2_PERMIT_BATCH]: parseAbiItem([
          "function permit2PermitBatch(PermitBatch permitBatch, bytes data)",
          ABI_STRUCT_PERMIT_BATCH,
          ABI_STRUCT_PERMIT_SINGLE,
          ABI_STRUCT_PERMIT_DETAILS,
     ]),
     [OperationType.PERMIT2_TRANSFER_FROM]: parseAbiItem(
          "function permit2TransferFrom(address token, address recipient, uint160 amount)",
     ),
     [OperationType.PERMIT2_TRANSFER_FROM_BATCH]: parseAbiItem([
          "function permit2PermitTransferFromBatch(AllowanceTransferDetails[] batchDetails)",
          ABI_STRUCT_ALLOWANCE_TRANSFER_DETAILS,
     ]),

     // SW PERMIT OPS
     [OperationType.PERMIT2_TRANSFER_TO_RELAYER_WITNESS]: parseAbiItem([
          "function deposit(uint256 _amount, address _token, address _user, address _permit2A, PermitBatch calldata _permit, bytes calldata _signature)",
          "struct PermitBatch { PermitDetails[] details; address spender; uint256 sigDeadline; }",
          "struct PermitDetails { address token; uint160 amount; uint48 expiration; uint48 nonce; }",
     ]),
     [OperationType.CLAIM_PERMIT]: parseAbiItem(
          "function withdrawERC20(address _token, uint256 _amount, address recipient)",
     ),
};

export class WalletOperationBuilder {
     userOps: UserOp[];

     // biome-ignore lint/suspicious/noExplicitAny: <explanation>
     externalUserOps: any[];

     constructor() {
          this.userOps = [];
          this.externalUserOps = [];
     }

     addUserOperation<TOperationType extends OperationUsed>(
          type: TOperationType,
          parameters: ABIParametersType<TOperationType>,
          contract: Address,
          value = 0n,
     ): void {
          const { encodedSelector, encodedInput } = encodeOperation(type, parameters);
          const operationCalldata = encodedSelector.concat(encodedInput.substring(2)) as Hex;
          const userOperation = { to: contract, amount: value, data: operationCalldata };
          this.userOps.push(userOperation);
     }

     addExternalUserOperation<TOperationType extends OperationUsed>(
          type: TOperationType,
          parameters: ABIParametersType<TOperationType>,
          contract: Address | undefined = undefined,
          value = 0n,
     ): void {
          const { encodedSelector, encodedInput } = encodeOperation(type, parameters);
          const operationCalldata = encodedSelector.concat(encodedInput.substring(2)) as Hex;
          const userOperation = { to: contract, value, data: operationCalldata };
          this.externalUserOps.push(userOperation);
     }

     addUserOperationFromCall = (calls: SwapCall[]): void => {
          // biome-ignore lint/complexity/noForEach: <explanation>
          calls.forEach((call: SwapCall) => {
               const { address, value, calldata } = call;
               const userOperation = { to: address, amount: BigInt(value), data: calldata };
               this.userOps.push(userOperation);
          });
     };
}

export type WalletOperation = {
     encodedInput: Hex;
     encodedSelector: Hex;
};

export function encodeOperation<TOperationType extends OperationUsed>(
     type: TOperationType,
     parameters: ABIParametersType<TOperationType>,
): WalletOperation {
     const operationAbiItem = ABI_PARAMETER[type];
     const encodedSelector = toFunctionSelector(operationAbiItem);
     const encodedInput = encodeAbiParameters(operationAbiItem.inputs, parameters as never);
     return { encodedSelector, encodedInput };
}
