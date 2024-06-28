import { type Address, erc20Abi, getContract } from "viem";
import { Deployments } from "../constants/deploymentUtils";
import type { ChainId } from "@pancakeswap/chains";
import { getPublicClient, getUserWalletClient, getWalletClient } from "../provider/walletClient";
import { smartWalletFactoryAbi as factoryAbi } from "../abis/SmartWalletFactoryAbi";
import { smartWalletAbi as walletAbi } from "../abis/SmartWalletAbi";
import { nonceHelperAbi } from "../abis/NonceHelperAbi";

export const getSmartWalletFactory = (chainId: ChainId) => {
      const client = getPublicClient({ chainId });
      const address = Deployments[chainId].ECDSAWalletFactory;
      return getContract({ address, client, abi: factoryAbi });
};

export const getSmartWallet = (chainId: ChainId, address: Address) => {
      const client = getPublicClient({ chainId });
      return getContract({ address, client, abi: walletAbi });
};

export const getErc20Contract = (chainId: ChainId, address: Address) => {
      const client = getPublicClient({ chainId });
      const walletClient = getWalletClient({ chainId });
      return getContract({ address, client, abi: erc20Abi });
};

export const getUserErc20Contract = (chainId: ChainId, address: Address) => {
      const client = getPublicClient({ chainId });
      const walletClient = getUserWalletClient({ chainId });
      return getContract({ address, client: walletClient, abi: erc20Abi });
};

export const getNonceHelperContract = (chainId: ChainId) => {
      const client = getPublicClient({ chainId });
      const address = Deployments[chainId].NonceHelper;
      return getContract({ address, client, abi: nonceHelperAbi });
};
