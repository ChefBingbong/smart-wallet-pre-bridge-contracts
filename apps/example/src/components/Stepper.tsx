import { Steps, StepsItem, StepsCompleted } from "@saas-ui/react";

import {
  Box,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  Flex,
} from "@chakra-ui/react";
import { ConfirmModalState } from "~/pages";
import { useMemo } from "react";

const steps = [
  {
    name: "step 1",
    title: "Approve SW",
  },
  {
    name: "step 2",
    title: "Transfer to SW",
  },
  {
    name: "step 3",
    title: "Transfer Fee",
  },
  {
    name: "step 4",
    title: "Approve Router",
  },
  {
    name: "step 5",
    title: "Execute Trade",
  },
];

export function TransactionBreakDownSteps({
  txState,
}: {
  txState: ConfirmModalState;
}) {
  const step = useMemo(() => {
    if (txState === ConfirmModalState.REVIEWING) return -1;
    if (txState === ConfirmModalState.APPROVING_TOKEN) return 0;
    if (txState === ConfirmModalState.PERMITTING) return 1;
    if (txState === ConfirmModalState.PENDING_CONFIRMATION) return 2;
    if (txState === ConfirmModalState.SIGNED) return 3;
    if (txState === ConfirmModalState.EXECUTING) return 4;
    if (txState === ConfirmModalState.COMPLETED) return 5;
    return -1;
  }, [txState]);
  return (
    <Steps
      step={step}
      marginX={-5}
      colorScheme="blue"
      color="blue"
      position="relative"
      left={1.5}
    >
      {steps.map((step, i) => (
        <StepsItem
          //     position="relative"
          flexDirection="column"
          key={`${step.name}-index`}
          {...step}
          render={() => (
            <>
              <StepSeparator
                style={{
                  position: "absolute",
                  width: "85%",
                  left: "35px",
                  height: "1px",
                  top: "48px",
                  background: "#6586df",
                  zIndex: 0,
                }}
              />

              <Step
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "120px",
                  minHeight: "120px",
                }}
              >
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <Box flexShrink="1">
                  <StepTitle style={{ fontSize: "11px" }}>
                    {step.title}
                  </StepTitle>
                </Box>
              </Step>
            </>
          )}
        />
      ))}
    </Steps>
  );
}
