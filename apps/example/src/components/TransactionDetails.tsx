import { useCallback, useEffect, useMemo, useState } from "react";
import { TransactionBreakDownSteps } from "./Stepper";
import { ChevronDownIcon, CopyIcon } from "@pancakeswap/uikit";
import type { SmartRouterTrade } from "@pancakeswap/smart-router";
import type {
  Currency,
  CurrencyAmount,
  Token,
  TradeType,
} from "@pancakeswap/swap-sdk-core";
import { LoadingSpinner } from "@saas-ui/react";
import { useTokenBalance } from "~/hooks/useBalance";
import BigNumber from "bignumber.js";
import { TransactionReceipt } from "viem";
import { ConfirmModalState } from "~/pages";

export const TransactionCard = ({
  fees,
  trade,
  inputValue,
  asset,
  toAsset,
  txState,
  feeAsset,
  tx,
}: {
  inputValue: string;
  fees: {
    gasCostInQuoteToken: CurrencyAmount<Currency>;
    gasCostInBaseToken: CurrencyAmount<Currency>;
    gasCostInNative: CurrencyAmount<Token>;
    gasCostInUSD: CurrencyAmount<Currency>;
    gasEstimate: CurrencyAmount<Currency>;
    gasCost: CurrencyAmount<Currency>;
  };
  txState: ConfirmModalState;
  asset: Currency;
  toAsset: Currency;
  feeAsset: Currency;
  trade: SmartRouterTrade<TradeType> | undefined;
  tx: TransactionReceipt | undefined;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const relayerBalance = useTokenBalance(
    feeAsset.address,
    "0xdBf48f5DB3d4bd13b9a29052947cB2edD6a2d132",
  );
  const userBalance = useTokenBalance(toAsset.wrapped.address);

  const formatRelauerBalance = useMemo(
    () => relayerBalance.balance.shiftedBy(-toAsset.decimals).toFixed(3),
    [relayerBalance, toAsset],
  );

  const formatUserBalance = useMemo(
    () => userBalance.balance.shiftedBy(-feeAsset.decimals).toFixed(3),
    [userBalance, toAsset],
  );

  const toggleAccordion = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (
      txState === ConfirmModalState.APPROVING_TOKEN ||
      (txState === ConfirmModalState.PENDING_CONFIRMATION && !isOpen)
    ) {
      toggleAccordion();
    }
    if (txState === ConfirmModalState.REVIEWING && isOpen && tx) {
      toggleAccordion();
    }
  }, [isOpen, txState, tx, toggleAccordion]);

  return (
    <div
      className={`relative my-2 items-center rounded-md bg-gray-100 px-4 focus-within:bg-gray-200 ${isOpen ? "open" : "closed"}`}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className={`flex w-full cursor-pointer items-center justify-between px-2 py-4 ${!fees || !trade ? "pointer-events-none" : ""}`}
        onClick={toggleAccordion}
      >
        <div className="font-semibold">Total Trade Cost</div>
        <div className="flex items-center justify-center gap-2">
          {trade && fees && (
            <div className="text-gray-500">{`${Number(trade?.outputAmount.toExact()).toFixed(3)} + ${Number(fees?.gasCost?.toExact()).toFixed(3)} = ${(Number(trade.outputAmount.toExact()) + Number(fees.gasCostInQuoteToken.toExact())).toFixed(3)} BUSD`}</div>
          )}
          {inputValue === "" && (
            <div className="text-gray-500">{"........"}</div>
          )}
          {inputValue !== "" ||
            !trade ||
            (!fees && <LoadingSpinner size="24px" />)}
          <ChevronDownIcon
            className="-mr-2"
            color="text-gray-400"
            width={25}
            height={25}
          />
        </div>
      </div>
      <div className="test-sm absolute left-0 h-[1px] w-full bg-gray-400" />
      <div className={`${!isOpen && "hidden"} w-full px-2 py-4 text-sm`}>
        <div className="mb-2 flex w-full justify-between">
          <div className="font-semibold text-gray-500">{"Native Fees"}</div>
          <div className="overflow-ellipsis text-gray-500">{`${Number(fees?.gasCostInNative.toExact()).toFixed(5)} CAKE`}</div>
        </div>
        <div className="test-sm mb-2 flex w-full justify-between">
          <div className="font-semibold text-gray-500">{"BUSD Fees"}</div>
          <div className="overflow-ellipsis text-gray-500">{`${Number(fees?.gasCostInQuoteToken.toExact()).toFixed(5)} BUSD`}</div>
        </div>
        <div className="w-fit-content lh-16 mt-8 flex flex-col gap-0">
          <div className="mb-2 flex w-full justify-between">
            <div className="bold   text-ml">{`Relayer ${feeAsset.symbol} Balance`}</div>
            <div className="overflow-ellipsis text-[17px]   ">
              {`${formatRelauerBalance} ${feeAsset.symbol}`}
            </div>
          </div>
          <div className="mb-2 flex w-full justify-between">
            <div className="bold  text-ml">{"Your BUSD Balance"}</div>
            <div className="overflow-ellipsis text-[17px]  ">
              {`${formatUserBalance} ${toAsset.symbol}`}
            </div>
          </div>

          <div className=" mt-6 w-full justify-between">
            <div className="mb-2 flex w-full justify-between">
              <div className="bold   ">{"Status"}</div>
              <div className="flex overflow-ellipsis text-[17px]   ">
                {tx?.status.toString()}
                <LoadingSpinner
                  display={
                    !tx || txState !== ConfirmModalState.REVIEWING
                      ? "none"
                      : "block"
                  }
                  width={4}
                  height={4}
                  color="blue"
                  background="bg-indigo-600 "
                />
              </div>
            </div>
            <div className="mb-2 flex w-full justify-between">
              <div className="bold  ">{"Tx Type"}</div>
              <div className="overflow-ellipsis  ">
                {tx?.type}
                <LoadingSpinner
                  display={
                    !tx || txState !== ConfirmModalState.REVIEWING
                      ? "none"
                      : "block"
                  }
                  width={4}
                  height={4}
                  color="blue"
                  background="bg-indigo-600 "
                />
              </div>
            </div>
            <div className="mb-2 flex w-full justify-between">
              <div className="bold  ">{"Block Number"}</div>
              <div className="overflow-ellipsis   ">
                {tx?.blockNumber.toString()}
                <LoadingSpinner
                  display={
                    !tx || txState !== ConfirmModalState.REVIEWING
                      ? "none"
                      : "block"
                  }
                  width={4}
                  height={4}
                  color="blue"
                  background="bg-indigo-600 "
                />
              </div>
            </div>
            <div className="mb-2 flex w-full justify-between">
              <div className="bold  ">{"Gas Used"}</div>
              <div className="overflow-ellipsis  ">
                {tx?.gasUsed.toString()}
                <LoadingSpinner
                  display={
                    !tx || txState !== ConfirmModalState.REVIEWING
                      ? "none"
                      : "block"
                  }
                  width={4}
                  height={4}
                  color="blue"
                  background="bg-indigo-600 "
                />
              </div>
            </div>
            <div className="text-md flex w-full items-center justify-between overflow-ellipsis text-sm  font-semibold text-gray-500">
              <div className=" font-semibold">{"Tx Hash"}</div>
              {tx && (
                <span className="flex   items-center justify-between rounded-md bg-gray-100 ">
                  {`...${tx?.transactionHash.slice(0, 21)}`}
                  <CopyIcon
                    width={16}
                    height={16}
                    className="ml-2 w-5 hover:cursor-pointer"
                    onClick={async () => {
                      await navigator.clipboard.writeText(tx?.transactionHash);
                    }}
                  />
                </span>
              )}
              <LoadingSpinner
                display={
                  !tx || txState !== ConfirmModalState.REVIEWING
                    ? "none"
                    : "block"
                }
                width={4}
                height={4}
                color="blue"
                background="bg-indigo-600 "
              />
            </div>
          </div>
          <TransactionBreakDownSteps txState={txState} />
        </div>
      </div>
    </div>
  );
};
