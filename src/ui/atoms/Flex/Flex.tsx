import React, { ReactNode } from "react";

import {
  buildGapClasses,
  buildMarginClasses,
  buildPaddingClasses,
  type GapSpacingProps,
  type MarginSpacingProps,
  type PaddingSpacingProps,
} from "../shared/spacingClasses";

export interface FlexProps
  extends MarginSpacingProps,
    PaddingSpacingProps,
    GapSpacingProps {
  children: ReactNode;
  justifyStart?: boolean;
  justifyEnd?: boolean;
  justifyCenter?: boolean;
  justifySpaceBetween?: boolean;
  justifySpaceAround?: boolean;
  justifyInitial?: boolean;
  alignStart?: boolean;
  alignEnd?: boolean;
  alignCenter?: boolean;
  alignSpaceBetween?: boolean;
  alignSpaceAround?: boolean;
  alignBaseline?: boolean;
  alignInitial?: boolean;
  alignStretch?: boolean;
  col?: boolean;
  row?: boolean;
  wrap?: boolean;
  wFull?: boolean;
  hFull?: boolean;
  flex1?: boolean;
  overflowY?: boolean;
  overflowHidden?: boolean;
  minHScreen?: boolean;
  mxAuto?: boolean;
  maxWMd?: boolean;
  maxWContainer?: boolean;
  maxH320?: boolean;
  maxH480?: boolean;
  chatScroll?: boolean;
  userMessage?: boolean;
  agentMessage?: boolean;
  textCenter?: boolean;
  textMuted?: boolean;
  textSm?: boolean;
  role?: string;
}

export const Flex = ({
  wrap,
  justifyStart,
  justifyEnd,
  justifyCenter,
  justifySpaceBetween,
  justifySpaceAround,
  justifyInitial,
  alignStart,
  alignEnd,
  alignCenter,
  alignSpaceBetween,
  alignSpaceAround,
  alignBaseline,
  alignInitial,
  alignStretch,
  col,
  row,
  wFull,
  hFull,
  flex1,
  overflowY,
  overflowHidden,
  minHScreen,
  maxWMd,
  maxWContainer,
  maxH320,
  maxH480,
  chatScroll,
  userMessage,
  agentMessage,
  textCenter,
  textMuted,
  textSm,
  role,
  children,
  ...spacingProps
}: FlexProps) => {
  const flexDirection = col ? "flex-col" : row ? "flex-row" : "flex-row";
  const flexWrap = wrap ? "flex-wrap" : "flex-nowrap";

  const justifyClasses =
    [
      justifyStart && "justify-start",
      justifyEnd && "justify-end",
      justifyCenter && "justify-center",
      justifySpaceBetween && "justify-between",
      justifySpaceAround && "justify-around",
      justifyInitial && "justify-initial",
    ].filter(Boolean)[0] || "justify-start";

  const alignClasses =
    [
      alignStart && "items-start",
      alignEnd && "items-end",
      alignCenter && "items-center",
      alignSpaceBetween && "items-stretch",
      alignSpaceAround && "items-stretch",
    alignBaseline && "items-baseline",
    alignInitial && "items-initial",
    alignStretch && "items-stretch",
  ].filter(Boolean)[0] || "items-start";

  const containerClasses = [
    "flex",
    flexDirection,
    flexWrap,
    justifyClasses,
    alignClasses,
    wFull && "w-full",
    hFull && "h-full",
    flex1 && "flex-1",
    overflowY && "overflow-y-auto",
    overflowHidden && "overflow-hidden",
    minHScreen && "min-h-screen",
    maxWMd && "max-w-md",
    maxWContainer && "max-w-[960px]",
    maxH320 && "max-h-[320px]",
    maxH480 && "max-h-[480px]",
    chatScroll && "mb-chat-scroll",
    userMessage && "mb-message-user",
    agentMessage && "mb-message-agent",
    textCenter && "text-center",
    textMuted && "text-mb-muted",
    textSm && "text-sm",
    buildMarginClasses(spacingProps),
    buildPaddingClasses(spacingProps),
    buildGapClasses(spacingProps),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role={role} className={containerClasses}>
      {children}
    </div>
  );
};

Flex.Row = (props: FlexProps) => <Flex {...props} row />;

Flex.Col = (props: FlexProps) => <Flex {...props} col />;

Flex.Center = (props: FlexProps) => <Flex {...props} justifyCenter alignCenter />;
