export type AdminMetricsPeriod = 'month' | '3m' | '6m' | '1y';

export type AdminMetricsGranularity = 'week' | 'month';

export type AdminPlatformMetricsPointDto = {
  periodStart: string;
  activePsychologists: number;
  activePatients: number;
  revenueCents: number;
};

export type AdminPlatformMetricsDto = {
  period: AdminMetricsPeriod;
  granularity: AdminMetricsGranularity;
  currency: string;
  platformRevenueCents: number;
  points: AdminPlatformMetricsPointDto[];
};
