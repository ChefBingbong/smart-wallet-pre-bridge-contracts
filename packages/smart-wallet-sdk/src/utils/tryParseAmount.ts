import { type Currency, CurrencyAmount } from "@pancakeswap/swap-sdk-core";
import { parseUnits } from "viem";

// try to parse a user entered amount for a given token
function tryParseAmount<T extends Currency>(value?: string, currency?: T | null): CurrencyAmount<T> | undefined {
     if (!value || !currency) {
          return undefined;
     }
     try {
          const typedValueParsed = parseUnits(value as `${number}`, currency.decimals).toString();

          if (typedValueParsed !== "0") {
               return CurrencyAmount.fromRawAmount(currency, BigInt(typedValueParsed));
          }
     } catch (error) {
          console.debug(`Failed to parse input amount: "${value}"`, error);
     }
     return undefined;
}

export default tryParseAmount;
