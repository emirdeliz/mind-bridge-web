import type {
  PatientSessionPaymentDto,
  PsychologistPatientPaymentsSummaryDto,
} from '../../dto/patient-payment/PatientPaymentDto';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type PatientPaymentsResponse = {
  summary: PsychologistPatientPaymentsSummaryDto;
};

type PatientPaymentResponse = {
  payment: PatientSessionPaymentDto;
};

export type UpsertPatientPaymentPayload = {
  patientId: string;
  billingMonth: string;
  amountCents: number;
  paidAt?: string;
  notes?: string | null;
};

export const getPsychologistPatientPaymentsApi = async (
  billingMonth?: string
): Promise<PsychologistPatientPaymentsSummaryDto> => {
  const response = await apiRequest<PatientPaymentsResponse>(
    '/psychologist/patient-payments',
    {
      query: billingMonth ? { month: billingMonth } : undefined,
    }
  );
  return keysToCamel<PatientPaymentsResponse>(response).summary;
};

export const upsertPsychologistPatientPaymentApi = async (
  payload: UpsertPatientPaymentPayload
): Promise<PatientSessionPaymentDto> => {
  const response = await apiRequest<PatientPaymentResponse>(
    '/psychologist/patient-payments',
    {
      method: 'POST',
      body: payload,
    }
  );
  return keysToCamel<PatientPaymentResponse>(response).payment;
};

export const deletePsychologistPatientPaymentApi = async (
  paymentId: string
): Promise<void> => {
  await apiRequest<void>(`/psychologist/patient-payments/${paymentId}`, {
    method: 'DELETE',
  });
};
