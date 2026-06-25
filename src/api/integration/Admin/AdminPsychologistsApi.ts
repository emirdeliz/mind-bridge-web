import type {
  AdminPatientInteractionPeriod,
  AdminPsychologistListItemDto,
  AdminPsychologistPatientViewDto,
  PsychologistBillingSummaryDto,
} from '@api';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type AdminPsychologistsResponse = {
  psychologists: AdminPsychologistListItemDto[];
};

type AdminPsychologistPatientsResponse = {
  patients: AdminPsychologistPatientViewDto[];
  interactionPeriod: AdminPatientInteractionPeriod;
};

type AdminPsychologistBillingResponse = {
  billing: PsychologistBillingSummaryDto;
};

export const listAdminPsychologistsApi =
  async (): Promise<AdminPsychologistListItemDto[]> => {
    const response = await apiRequest<AdminPsychologistsResponse>(
      '/admin/psychologists'
    );
    return keysToCamel<AdminPsychologistsResponse>(response).psychologists;
  };

export const listAdminPsychologistPatientsApi = async (
  psychologistId: string,
  options: {
    name?: string;
    includeDeleted?: boolean;
    interactionPeriod?: AdminPatientInteractionPeriod;
  } = {}
): Promise<AdminPsychologistPatientsResponse> => {
  const params = new URLSearchParams();
  if (options.name?.trim()) {
    params.set('name', options.name.trim());
  }
  if (options.includeDeleted) {
    params.set('includeDeleted', 'true');
  }
  if (options.interactionPeriod) {
    params.set('interactionPeriod', options.interactionPeriod);
  }

  const query = params.toString();
  const response = await apiRequest<AdminPsychologistPatientsResponse>(
    `/admin/psychologists/${encodeURIComponent(psychologistId)}/patients${
      query ? `?${query}` : ''
    }`
  );
  return keysToCamel<AdminPsychologistPatientsResponse>(response);
};

export const getAdminPsychologistBillingApi = async (
  psychologistId: string,
  billingMonth?: string | null
): Promise<PsychologistBillingSummaryDto> => {
  const query = billingMonth
    ? `?month=${encodeURIComponent(billingMonth)}`
    : '';
  const response = await apiRequest<AdminPsychologistBillingResponse>(
    `/admin/psychologists/${encodeURIComponent(psychologistId)}/billing${query}`
  );
  return keysToCamel<AdminPsychologistBillingResponse>(response).billing;
};
