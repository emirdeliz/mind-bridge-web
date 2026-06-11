export type PatientSessionPaymentDto = {
  id: string;
  psychologistId: string;
  patientId: string;
  billingMonth: string;
  amountCents: number;
  paidAt: string;
  notes: string | null;
};

export type PatientPaymentRowDto = {
  patientId: string;
  fullName: string | null;
  email: string | null;
  isCompliant: boolean;
  payment: PatientSessionPaymentDto | null;
};

export type PsychologistPatientPaymentsSummaryDto = {
  billingMonth: string;
  isCurrentMonth: boolean;
  currency: string;
  totalCollectedCents: number;
  compliantCount: number;
  nonCompliantCount: number;
  expectedPatientCount: number;
  patients: PatientPaymentRowDto[];
  availableMonths: string[];
};
