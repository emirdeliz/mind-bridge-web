const pickClasses = (flags: Record<string, boolean | undefined>, map: Record<string, string>) =>
  Object.entries(map)
    .filter(([key]) => flags[key])
    .map(([, className]) => className)
    .join(" ");

export const MARGIN_CLASS_MAP = {
  m1: "m-1",
  m2: "m-2",
  m4: "m-4",
  m6: "m-6",
  m8: "m-8",
  mt1: "mt-1",
  mt2: "mt-2",
  mt4: "mt-4",
  mt6: "mt-6",
  mt8: "mt-8",
  mt10: "mt-10",
  mb1: "mb-1",
  mb2: "mb-2",
  mb4: "mb-4",
  mb6: "mb-6",
  mb8: "mb-8",
  ml1: "ml-1",
  ml2: "ml-2",
  ml4: "ml-4",
  mr1: "mr-1",
  mr2: "mr-2",
  mr4: "mr-4",
  mxAuto: "mx-auto",
} as const;

export const PADDING_CLASS_MAP = {
  p1: "p-1",
  p2: "p-2",
  p3: "p-3",
  p4: "p-4",
  p6: "p-6",
  pt1: "pt-1",
  pt2: "pt-2",
  pt4: "pt-4",
  pb1: "pb-1",
  pb2: "pb-2",
  pb4: "pb-4",
  px2: "px-2",
  px3: "px-3",
  px4: "px-4",
  py1: "py-1",
  py2: "py-2",
  py8: "py-8",
  smPx6: "sm:px-6",
  lgPx8: "lg:px-8",
} as const;

export const GAP_CLASS_MAP = {
  gap1: "gap-1",
  gap2: "gap-2",
  gap4: "gap-4",
  gap5: "gap-5",
  gap6: "gap-6",
  gap8: "gap-8",
} as const;

export type MarginSpacingProps = {
  [K in keyof typeof MARGIN_CLASS_MAP]?: boolean;
};

export type PaddingSpacingProps = {
  [K in keyof typeof PADDING_CLASS_MAP]?: boolean;
};

export type GapSpacingProps = {
  [K in keyof typeof GAP_CLASS_MAP]?: boolean;
};

export const buildMarginClasses = (props: MarginSpacingProps) => pickClasses(props, MARGIN_CLASS_MAP);

export const buildPaddingClasses = (props: PaddingSpacingProps) => pickClasses(props, PADDING_CLASS_MAP);

export const buildGapClasses = (props: GapSpacingProps) => pickClasses(props, GAP_CLASS_MAP);
