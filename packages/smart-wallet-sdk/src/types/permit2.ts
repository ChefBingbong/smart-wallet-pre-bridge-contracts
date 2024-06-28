import type { PermitTransferFrom, Witness } from "@pancakeswap/permit2-sdk";
import type { Permit2Signature } from "@pancakeswap/universal-router-sdk";

export type Permit2Operations = {
      permit2Permit: Permit2Signature;
};

export type SmartWalletPermitOptions = Permit2Operations & {
      permit2TransferFrom: {
            permit: PermitTransferFrom;
            witness: Witness;
      };
};

export type UniversalRouterPermitOptions = Permit2Operations;
