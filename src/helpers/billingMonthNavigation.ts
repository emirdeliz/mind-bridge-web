export const billingMonthFromDate = (date: Date): string => {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-01`;
};

export const previousBillingMonth = (billingMonth: string): string => {
  const date = new Date(`${billingMonth}T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return billingMonthFromDate(date);
};

export const canNavigateToPreviousBillingMonth = (
  billingMonth: string,
  oldestBillingMonth?: string,
): boolean => {
  if (!oldestBillingMonth) {
    return false;
  }

  return previousBillingMonth(billingMonth) >= oldestBillingMonth;
};
