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

export type AdminPsychologistListItemDto = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  activePatientCount: number;
  totalPatientCount: number;
};

export type AdminPatientInteractionPeriod =
  | 'week'
  | 'month'
  | '3m'
  | '6m'
  | '1y';

export type AdminPsychologistPatientViewDto = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  lastConsultationAt: string | null;
  isDeleted: boolean;
  aiInteractionCount: number;
};
