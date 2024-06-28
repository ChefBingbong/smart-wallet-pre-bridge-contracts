import { type ChainId, type Currency, Price, type Token, WNATIVE } from "@pancakeswap/sdk";
import { usdGasTokensByChain } from "../constants/gasTokens";
import tryParseAmount from "./tryParseAmount";

export function getUsdGasToken(chainId: ChainId): Token | null {
     return usdGasTokensByChain[chainId]?.[0] ?? null;
}

export function getNativeWrappedToken(chainId: ChainId): Token | null {
     return WNATIVE[chainId] ?? null;
}

export const getTokenPriceByNumber = (baseCurrency: Currency, quoteCurrency: Currency, price: number) => {
     const quoteAmount = tryParseAmount(String(price), baseCurrency);
     const baseAmount = tryParseAmount("1", quoteCurrency);
     if (!baseAmount || !quoteAmount) {
          return undefined;
     }

     return new Price({ baseAmount, quoteAmount });
};
