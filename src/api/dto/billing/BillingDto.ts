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

export type PsychologistBillingSummaryDto = {
  enabledPatientCount: number;
  unitPriceCents: number;
  currency: string;
  grossAmountCents: number;
  discount: PsychologistBillingDiscountDto | null;
  discountAmountCents: number;
  netAmountCents: number;
  history: PsychologistBillingMonthlyEntryDto[];
};
