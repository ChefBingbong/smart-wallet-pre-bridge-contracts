import { ChainId } from "@pancakeswap/chains";
import {
      bsc,
      bscTestnet,
      goerli,
      mainnet,
      zkSync,
      polygonZkEvm,
      arbitrum,
      base,
      scrollSepolia,
      arbitrumGoerli,
      baseGoerli,
      opBNBTestnet,
      zkSyncTestnet,
      linea,
      lineaTestnet,
      polygonZkEvmTestnet,
      opBNB,
      type Chain,
      sepolia,
      arbitrumSepolia,
      baseSepolia,
} from "viem/chains";
import { ExtendedChainId } from "../constants/deploymentUtils";

export const CHAINS: Chain[] = [
      bsc,
      bscTestnet,
      goerli,
      mainnet,
      zkSync,
      polygonZkEvm,
      polygonZkEvmTestnet,
      arbitrum,
      base,
      scrollSepolia,
      arbitrumGoerli,
      baseGoerli,
      opBNBTestnet,
      zkSyncTestnet,
      opBNB,
      linea,
      lineaTestnet,
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

export const PUBLIC_NODES = {
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
      [ChainId.POLYGON_ZKEVM_TESTNET]: ["https://polygon-zkevm-testnet.rpc.thirdweb.com"],
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
      [ChainId.BASE]: ["https://base.publicnode.com", ...base.rpcUrls.default.http].filter(Boolean),
      [ChainId.BASE_TESTNET]: baseGoerli.rpcUrls.default.http,
      [ChainId.SCROLL_SEPOLIA]: scrollSepolia.rpcUrls.default.http,
      [ChainId.SEPOLIA]: sepolia.rpcUrls.default.http,
      [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia.rpcUrls.default.http,
      [ChainId.BASE_SEPOLIA]: baseSepolia.rpcUrls.default.http,
      [ExtendedChainId.POLYGON_TESTNET]: ["https://rpc.ankr.com/polygon_mumbai"],
      [ExtendedChainId.LOCAL]: ["http://127.0.0.1:8545/"],
} satisfies Record<ChainId | ExtendedChainId, readonly string[]>;
