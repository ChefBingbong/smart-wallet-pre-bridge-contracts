import { ChainId } from "@pancakeswap/chains";
import type { Address } from "viem";

export enum Contracts {
     ECDSAWalletFactory = "ECDSAWalletFactory",
     SmartWalletFactory = "SmartWalletFactory",
     Depositor = "Depositor",
     Permit2 = "Permit2",
     NonceHelper = "NonceHelper",
}
export enum ExtendedChainId {
     POLYGON_TESTNET = 80001,
     LOCAL = 31337,
}
type Deployments = {
     [chain in ChainId | ExtendedChainId]: { [contract in Contracts]: Address };
};

export const polygonTokens = {
     weth: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
};

export const Deployments: Deployments = {
     [ExtendedChainId.POLYGON_TESTNET]: {
          ECDSAWalletFactory: "0xC6D72727dAD90e4711412e369aE67706d0EF7C02",
          SmartWalletFactory: "0xab381dB93d006bF653D62c1727D418f6E76a28e7",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
          ...polygonTokens,
     },
     [ExtendedChainId.LOCAL]: {
          ECDSAWalletFactory: "0x39ffd48bDa47f53fD39D0d0D82291a9E4521f0E5",
          SmartWalletFactory: "0xC6885300c999a9C7E2913927E11eE95762CC85c9",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
          // weth: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
     },
     [ChainId.ETHEREUM]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.GOERLI]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.BSC]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.BSC_TESTNET]: {
          //     ECDSAWalletFactory: "0xdEcC697485974455A97D2A7bc7e14d4B49eF7a76",
          //     SmartWalletFactory: "0x8f50F96C46B51c7a891AE876f5e78fB58B8260f0",
          ECDSAWalletFactory: "0xf40A6A3b302D465dfCBB4d7dB6B660720F1F642a",
          SmartWalletFactory: "0x844aE9955cBd84caE8bC8c0E0FAA1191f3C43d84",
          Depositor: "0x",
          Permit2: "0x89b5B5d93245f543D53CC55923DF841349a65169",
          NonceHelper: "0x8756307d06955e029be44984D310fD060B1A5A2c",
     }, //0x580b978cC31aDb5065f9e8401f076b7Da7eD4b4A
     [ChainId.ZKSYNC_TESTNET]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.ZKSYNC]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.OPBNB_TESTNET]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.OPBNB]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.POLYGON_ZKEVM]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.POLYGON_ZKEVM_TESTNET]: {
          ECDSAWalletFactory: "0x4E06FBDb972F3473C4CD838156156F7B7dA0405D",
          SmartWalletFactory: "0x798e5A9A79f6229AB8792B5a98f2b49B1b3a3cF6",
          Depositor: "0x2BAF15BA3A2d06C763C03e17C15B9370C3c73b12",
          Permit2: "0x",
          NonceHelper: "0x",
     },

     [ChainId.ARBITRUM_ONE]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.ARBITRUM_GOERLI]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.ARBITRUM_SEPOLIA]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.SCROLL_SEPOLIA]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.LINEA]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.LINEA_TESTNET]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.BASE]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.BASE_TESTNET]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.BASE_SEPOLIA]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
     [ChainId.SEPOLIA]: {
          ECDSAWalletFactory: "0x",
          SmartWalletFactory: "0x",
          Depositor: "0x",
          Permit2: "0x",
          NonceHelper: "0x",
     },
};
