import { ChainId } from "@pancakeswap/chains";
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  bscTestnet,
  bsc as bsc_,
  goerli,
  linea,
  lineaTestnet,
  mainnet,
  opBNB,
  opBNBTestnet,
  polygonZkEvm,
  polygonZkEvmTestnet,
  scrollSepolia,
  sepolia,
  zkSync,
  zkSyncTestnet,
  type Chain,
} from "wagmi/chains";

export enum ExtendedChainId {
  LOCAL = 31337,
}

const bsc = {
  ...bsc_,
  rpcUrls: {
    ...bsc_.rpcUrls,
    public: {
      ...bsc_.rpcUrls.public,
      http: ["https://bsc-dataseed.binance.org/"],
    },
    default: {
      ...bsc_.rpcUrls.default,
      http: ["https://bsc-dataseed.binance.org/"],
    },
  },
} satisfies Chain;

export const L2_CHAIN_IDS: ChainId[] = [
  ChainId.ARBITRUM_ONE,
  ChainId.ARBITRUM_GOERLI,
  ChainId.POLYGON_ZKEVM,
  ChainId.POLYGON_ZKEVM_TESTNET,
  ChainId.ZKSYNC,
  ChainId.ZKSYNC_TESTNET,
  ChainId.LINEA_TESTNET,
  ChainId.LINEA,
  ChainId.BASE,
  ChainId.BASE_TESTNET,
  ChainId.OPBNB,
  ChainId.OPBNB_TESTNET,
  ChainId.ARBITRUM_SEPOLIA,
  ChainId.BASE_SEPOLIA,
];

export const CHAINS = [
  bsc,
  bscTestnet,
  mainnet,
  goerli,
  sepolia,
  polygonZkEvm,
  polygonZkEvmTestnet,
  zkSync,
  zkSyncTestnet,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  linea,
  lineaTestnet,
  base,
  baseGoerli,
  baseSepolia,
  opBNB,
  opBNBTestnet,
  scrollSepolia,
];

const POLYGON_ZKEVM_NODES = [
  "https://f2562de09abc5efbd21eefa083ff5326.zkevm-rpc.com/",
  ...polygonZkEvm.rpcUrls.default.http,
];

const ARBITRUM_NODES = [
  ...arbitrum.rpcUrls.default.http,
  "https://arbitrum-one.publicnode.com",
  "https://arbitrum.llamarpc.com",
].filter(Boolean);

export const PUBLIC_NODES: Record<
  ChainId | ExtendedChainId,
  readonly string[]
> = {
  [ChainId.BSC]: [
    "https://bsc.publicnode.com",
    "https://binance.llamarpc.com",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.binance.org",
  ].filter(Boolean),
  [ChainId.BSC_TESTNET]: ["https://data-seed-prebsc-1-s2.binance.org:8545"],
  [ChainId.ETHEREUM]: [
    "https://ethereum.publicnode.com",
    "https://eth.llamarpc.com",
    "https://cloudflare-eth.com",
  ].filter(Boolean),
  [ChainId.GOERLI]: ["https://eth-goerli.public.blastapi.io"].filter(Boolean),
  [ChainId.ARBITRUM_ONE]: [...ARBITRUM_NODES].filter(Boolean),
  [ChainId.ARBITRUM_GOERLI]: arbitrumGoerli.rpcUrls.default.http,
  [ChainId.POLYGON_ZKEVM]: [...POLYGON_ZKEVM_NODES],
  [ChainId.POLYGON_ZKEVM_TESTNET]: [
    "https://polygon-zkevm-testnet.rpc.thirdweb.com",
  ],
  [ChainId.ZKSYNC]: [...zkSync.rpcUrls.default.http],
  [ChainId.ZKSYNC_TESTNET]: zkSyncTestnet.rpcUrls.default.http,
  [ChainId.LINEA]: linea.rpcUrls.default.http,
  [ChainId.LINEA_TESTNET]: [
    "https://rpc.goerli.linea.build",
    "https://linea-testnet.rpc.thirdweb.com",
    "https://consensys-zkevm-goerli-prealpha.infura.io/v3/93e8a17747e34ec0ac9a554c1b403965",
  ],
  [ChainId.OPBNB_TESTNET]: opBNBTestnet.rpcUrls.default.http,
  [ChainId.OPBNB]: ["https://opbnb.publicnode.com"],
  [ChainId.BASE]: [
    "https://base.publicnode.com",
    ...base.rpcUrls.default.http,
  ].filter(Boolean),
  [ChainId.BASE_TESTNET]: baseGoerli.rpcUrls.default.http,
  [ChainId.SCROLL_SEPOLIA]: scrollSepolia.rpcUrls.default.http,
  [ChainId.SEPOLIA]: sepolia.rpcUrls.default.http,
  [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia.rpcUrls.default.http,
  [ChainId.BASE_SEPOLIA]: baseSepolia.rpcUrls.default.http,
  [ExtendedChainId.LOCAL]: ["http://127.0.0.1:8545/"],
} satisfies Record<ChainId | ExtendedChainId, readonly string[]>;

export const ChainsAdapter: { [chain in ChainId]: Chain } = {
  [ChainId.ETHEREUM]: mainnet,
  [ChainId.GOERLI]: goerli,
  [ChainId.BSC]: bsc_,
  [ChainId.BSC_TESTNET]: bscTestnet,
  [ChainId.ZKSYNC]: zkSync,
  [ChainId.ZKSYNC_TESTNET]: zkSyncTestnet,
  [ChainId.OPBNB_TESTNET]: opBNBTestnet,
  [ChainId.OPBNB]: opBNB,
  [ChainId.POLYGON_ZKEVM]: polygonZkEvm,
  [ChainId.POLYGON_ZKEVM_TESTNET]: polygonZkEvmTestnet,
  [ChainId.ARBITRUM_ONE]: arbitrum,
  [ChainId.ARBITRUM_GOERLI]: arbitrumGoerli,
  [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia,
  [ChainId.SCROLL_SEPOLIA]: scrollSepolia,
  [ChainId.LINEA]: linea,
  [ChainId.LINEA_TESTNET]: lineaTestnet,
  [ChainId.BASE]: base,
  [ChainId.BASE_TESTNET]: baseGoerli,
  [ChainId.BASE_SEPOLIA]: baseSepolia,
  [ChainId.SEPOLIA]: sepolia,
};

export const allChains = Object.values(ChainsAdapter);
