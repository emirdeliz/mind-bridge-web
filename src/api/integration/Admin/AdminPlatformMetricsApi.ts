import type { AdminMetricsPeriod, AdminPlatformMetricsDto } from '@api';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type AdminPlatformMetricsResponse = {
  metrics: AdminPlatformMetricsDto;
};

export const getAdminPlatformMetricsApi = async (
  period: AdminMetricsPeriod
): Promise<AdminPlatformMetricsDto> => {
  const response = await apiRequest<AdminPlatformMetricsResponse>(
    `/admin/platform-metrics?period=${encodeURIComponent(period)}`
  );
  return keysToCamel<AdminPlatformMetricsResponse>(response).metrics;
};
