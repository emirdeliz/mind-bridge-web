export const MB_CHART_TEXT = "#e8edf7";
export const MB_CHART_MUTED = "#8b9ab8";
export const MB_CHART_BORDER = "#2a3650";

export const mbChartTitleStyle = (text: string) => ({
  text,
  left: "center" as const,
  top: 8,
  textStyle: { fontSize: 14, color: MB_CHART_TEXT },
});

export const mbCategoryAxis = <T extends Record<string, unknown>>(config: T = {} as T) => ({
  ...config,
  axisLabel: {
    color: MB_CHART_MUTED,
    ...((config.axisLabel as object) ?? {}),
  },
  axisLine: {
    lineStyle: { color: MB_CHART_BORDER },
    ...((config.axisLine as object) ?? {}),
  },
});

export const mbValueAxis = <T extends Record<string, unknown>>(config: T = {} as T) => ({
  type: "value" as const,
  ...config,
  axisLabel: {
    color: MB_CHART_MUTED,
    ...((config.axisLabel as object) ?? {}),
  },
  splitLine: {
    lineStyle: { color: MB_CHART_BORDER, opacity: 0.35 },
    ...((config.splitLine as object) ?? {}),
  },
  axisLine: { show: false },
});

export const mbChartLegend = (config: Record<string, unknown> = {}) => ({
  ...config,
  textStyle: {
    color: MB_CHART_MUTED,
    ...((config.textStyle as object) ?? {}),
  },
});
