import type { Address } from "viem";

export interface UserOp {
     to: Address;
     amount: bigint;
     data: Address;
}

export interface AllowanceOp {
     details: {
          token: Address;
          amount: bigint;
          expiration: bigint;
          nonce: bigint;
     }[];
     spender: Address;
     sigDeadline: bigint;
}
