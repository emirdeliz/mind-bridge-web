import type { PsychologistBillingSummaryDto } from '@api';
import { apiRequest } from '@api/http/apiClient';
import { keysToCamel } from '@helpers';

type BillingResponse = {
  billing: PsychologistBillingSummaryDto;
};

export const getPsychologistBillingApi =
  async (): Promise<PsychologistBillingSummaryDto> => {
    const response = await apiRequest<BillingResponse>('/psychologist/billing');
    return keysToCamel<BillingResponse>(response).billing;
  };
