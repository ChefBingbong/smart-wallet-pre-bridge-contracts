import type { WalletOperationBuilder } from "./walletOperations";

export enum RouterTradeType {
      UniversalRouterTrade = "UniversalRouter",
      ClassicTrade = "SmartRouter",
      SmartWalletTrade = "SmartWalletTrade",
      SmartWalletTradeWithPermit2 = "SmartWalletTradeWithPermit2",
}

export enum Routers {
      UniversalRouter = "UniversalRouter",
      SmartOrderRouter = "SmartRouter",
}

// interface for entities that can be encoded as a Universal Router command
export interface Command {
      tradeType: RouterTradeType;
      encode(planner: WalletOperationBuilder): void;
}
