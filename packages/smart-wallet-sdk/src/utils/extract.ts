import { type Hex, decodeFunctionData, type ChainFormatter } from "viem";
import type { ErrorType } from "viem/_types/errors/utils";
export type ExtractErrorType = ErrorType;

export function extract(
      value_: Record<string, unknown>,
      { format }: { format?: ChainFormatter["format"] | undefined },
) {
      if (!format) return {};

      const value: Record<string, unknown> = {};
      function extract_(formatted: Record<string, never>) {
            const keys = Object.keys(formatted);
            for (const key of keys) {
                  if (key in value_) value[key] = value_[key];
                  if (formatted[key] && typeof formatted[key] === "object" && !Array.isArray(formatted[key]))
                        extract_(formatted[key]);
            }
      }

      const formatted = format(value_ || {});
      extract_(formatted);

      return value;
}

export function decodeFunctionSelector(data: Hex, abi: never) {
      try {
            const functionSelector = decodeFunctionData({ data, abi: abi });
            return functionSelector;
      } catch (error) {
            console.error("Error decoding function selector:", error);
            return undefined;
      }
}
