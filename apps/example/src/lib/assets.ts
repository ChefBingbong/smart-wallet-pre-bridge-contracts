import { bscTestnetTokens } from "@pancakeswap/tokens";
import { Chain } from "./chains";
import { ChainId, ERC20Token } from "@pancakeswap/sdk";
export type AssetIconsConfig = {
  Icon: string | null;
};

export type AssetLabelsConfig = {
  shortName: string;
  fullName: string;
  decimals: number;
  address: string;
  chain: string;
  chainId: 97;
};

export type AssetBaseConfig = AssetIconsConfig & AssetLabelsConfig;

export enum Asset {
  BUSD = "BUSD",
  WBNB = "WBNB",
  CAKE = "CAKE",
}

export const tickerToAddress: Record<string, string> = {
  [Asset.BUSD]: "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814",
  [Asset.WBNB]: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  [Asset.CAKE]: "0xFa60D973F7642B748046464e165A65B7323b0DEE",
};
export const assetsBaseConfig: Record<Asset, ERC20Token> = {
  BUSD: new ERC20Token(
    ChainId.BSC_TESTNET,
    "0x6F451Eb92d7dE92DdF6939d9eFCE6799246B3a4b",
    18,
    "BUSD",
    "Binance USD",
    "https://www.paxos.com/busd/",
  ),
  WBNB: bscTestnetTokens.wbnb,
  CAKE: new ERC20Token(
    ChainId.BSC_TESTNET,
    "0x501B55184813f7a29eb98DECD8EC9B6D07DEB263",
    18,
    "CAKE",
    "PancakeSwap Token",
    "https://pancakeswap.finance/",
  ),
};

export const supportedAssets = [Asset.BUSD, Asset.WBNB, Asset.CAKE];

export type AssetConfig = {
  chains: Chain[];
};

export const assets: Record<Asset, AssetConfig> = {
  BUSD: { chains: [Chain.Aurora] },
  WBNB: { chains: [Chain.Avalanche] },
  CAKE: { chains: [Chain.BNBChain] },
};
