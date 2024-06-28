import { ChainId } from "@pancakeswap/chains";
import type { ERC20Token } from "@pancakeswap/sdk";
import {
      ethereumTokens,
      sepoliaTokens,
      goerliTestnetTokens,
      bscTokens,
      bscTestnetTokens,
      zksyncTokens,
      zkSyncTestnetTokens,
      opBnbTestnetTokens,
      opBnbTokens,
      polygonZkEvmTokens,
      polygonZkEvmTestnetTokens,
      arbitrumTokens,
      arbitrumGoerliTokens,
      arbSepoliaTokens,
      scrollSepoliaTokens,
      lineaTokens,
      baseTokens,
      baseTestnetTokens,
      baseSepoliaTokens,
} from "@pancakeswap/tokens";
import { Address } from "viem";

const spreadObject = (list: { [token: string]: ERC20Token }) => ({ ...list });

export const AssetAdapter: { [chain in ChainId]: { [token: string]: ERC20Token } } = {
      [ChainId.ETHEREUM]: spreadObject(ethereumTokens),
      [ChainId.GOERLI]: spreadObject(goerliTestnetTokens),
      [ChainId.BSC]: spreadObject(bscTokens),
      [ChainId.BSC_TESTNET]: spreadObject(bscTestnetTokens),
      [ChainId.ZKSYNC]: spreadObject(zksyncTokens),
      [ChainId.ZKSYNC_TESTNET]: spreadObject(zkSyncTestnetTokens),
      [ChainId.OPBNB_TESTNET]: spreadObject(opBnbTestnetTokens),
      [ChainId.OPBNB]: spreadObject(opBnbTokens),
      [ChainId.POLYGON_ZKEVM]: spreadObject(polygonZkEvmTokens),
      [ChainId.POLYGON_ZKEVM_TESTNET]: spreadObject(polygonZkEvmTestnetTokens),
      [ChainId.ARBITRUM_ONE]: spreadObject(arbitrumTokens),
      [ChainId.ARBITRUM_GOERLI]: spreadObject(arbitrumGoerliTokens),
      [ChainId.ARBITRUM_SEPOLIA]: spreadObject(arbSepoliaTokens),
      [ChainId.SCROLL_SEPOLIA]: spreadObject(scrollSepoliaTokens),
      [ChainId.LINEA]: spreadObject(lineaTokens),
      [ChainId.LINEA_TESTNET]: spreadObject(lineaTokens),
      [ChainId.BASE]: spreadObject(baseTokens),
      [ChainId.BASE_TESTNET]: spreadObject(baseTestnetTokens),
      [ChainId.BASE_SEPOLIA]: spreadObject(baseSepoliaTokens),
      [ChainId.SEPOLIA]: spreadObject(sepoliaTokens),
};

export const SupportedFeeTokens: { [chain: number]: Address[] } = {
      [ChainId.BSC_TESTNET]: ["0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"],
};
