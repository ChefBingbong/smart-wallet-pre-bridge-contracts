import type { Currency } from "@pancakeswap/swap-sdk-core";
import { useMemo } from "react";
import { ConfirmModalState } from "~/pages";

export const useTheme = (
  txState: ConfirmModalState,
  asset: Currency,
  toAsset: Currency,
) => {
  const transactionStatusDisplay = useMemo(() => {
    switch (txState) {
      case ConfirmModalState.REVIEWING:
        return `Swap ${asset.symbol} for ${toAsset.symbol}`;
      case ConfirmModalState.APPROVING_TOKEN:
        return `Approving Smart wallet for ${asset.symbol}`;
      case ConfirmModalState.PERMITTING:
        return `Permitting Relayer ${asset.symbol}`;
      case ConfirmModalState.PENDING_CONFIRMATION:
        return "Awaiting Confirmtion";
      case ConfirmModalState.EXECUTING:
        return "Executing Wallet Ops";
      case ConfirmModalState.COMPLETED:
        return "transaction Successful";
      case ConfirmModalState.FAILED:
        return "transaction Failed";
      default:
        return `Trade ${asset.symbol}`;
    }
  }, [txState, asset, toAsset]);

  const primaryColor = useMemo(() => {
    if (txState === ConfirmModalState.FAILED) return "bg-red-600";
    return "bg-indigo-600";
  }, [txState]);
  const secondaryColor = useMemo(() => {
    if (txState === ConfirmModalState.FAILED) return "bg-red-600";
    return "bg-indigo-600";
  }, [txState]);

  return { transactionStatusDisplay, primaryColor, secondaryColor };
};
