import { ChainId } from '@pancakeswap/chains'
import type { Address } from 'viem'

export const SUPPORTED_CHAIN_IDS = [ChainId.BSC, ChainId.ZKSYNC] as const

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export type ContractAddresses<T extends ChainId = SupportedChainId> = {
      [chainId in T]: Address
    }

export const chainlinkOracleBNB: Record<string, Address> = {
  [ChainId.BSC]: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
  [ChainId.ZKSYNC]: '0x',
  // [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleCAKE: Record<string, Address> = {
  [ChainId.BSC]: '0xB6064eD41d4f67e353768aA239cA86f4F73665a1',
  [ChainId.ZKSYNC]: '0x',
  // [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleETH: Record<string, Address> = {
  [ChainId.BSC]: '0x',
  [ChainId.ZKSYNC]: '0x',
  // [ChainId.ARBITRUM_ONE]: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleWBTC: Record<string, Address> = {
  [ChainId.BSC]: '0x',
  [ChainId.ZKSYNC]: '0x',
  // [ChainId.ARBITRUM_ONE]: '0x6ce185860a4963106506C203335A2910413708e9',
} as const satisfies ContractAddresses<SupportedChainId>
