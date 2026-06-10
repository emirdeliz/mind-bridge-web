export type PsychologistBillingDiscountDto = {
  discountPercent: number;
  label: string | null;
};

export type PsychologistBillingMonthlyEntryDto = {
  billingMonth: string;
  enabledPatientCount: number;
  unitPriceCents: number;
  grossAmountCents: number;
  discountPercent: number;
  discountAmountCents: number;
  netAmountCents: number;
};

export type PsychologistBillablePatientDto = {
  patientId: string;
  fullName: string | null;
  email: string | null;
  enabledAt: string;
  disabledAt: string | null;
  deactivatedDuringMonth: boolean;
  isCurrentlyEnabled: boolean;
};

export type PsychologistBillingSummaryDto = {
  billingMonth: string;
  isCurrentMonth: boolean;
  enabledPatientCount: number;
  currentlyEnabledPatientCount: number;
  unitPriceCents: number;
  currency: string;
  grossAmountCents: number;
  discount: PsychologistBillingDiscountDto | null;
  discountPercent: number;
  discountAmountCents: number;
  netAmountCents: number;
  billablePatients: PsychologistBillablePatientDto[];
  history: PsychologistBillingMonthlyEntryDto[];
};
