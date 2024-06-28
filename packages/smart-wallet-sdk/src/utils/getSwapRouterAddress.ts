import type { ChainId } from "@pancakeswap/chains";
import { SMART_ROUTER_ADDRESSES } from "@pancakeswap/smart-router";

export const getSwapRouterAddress = (chainId: ChainId) => {
     return SMART_ROUTER_ADDRESSES[chainId];
};
