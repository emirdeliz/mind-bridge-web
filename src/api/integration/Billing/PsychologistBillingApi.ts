import type { PsychologistBillingSummaryDto } from '@api';
import { apiRequest } from '@api/http/apiClient';
import { keysToCamel } from '@helpers';

type BillingResponse = {
  billing: PsychologistBillingSummaryDto;
};

export const getPsychologistBillingApi = async (
  billingMonth?: string,
): Promise<PsychologistBillingSummaryDto> => {
  const query = billingMonth
    ? `?month=${encodeURIComponent(billingMonth)}`
    : '';
  const response = await apiRequest<BillingResponse>(
    `/psychologist/billing${query}`,
  );
  return keysToCamel<BillingResponse>(response).billing;
};
