import type { LikertCheckInDto } from '@api';

/** Local calendar date key (YYYY-MM-DD) for daily Likert reset. */
export const getLocalDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLikertCheckInDateKey = (
  checkIn: LikertCheckInDto | null | undefined
): string | null => {
  if (!checkIn) {
    return null;
  }

  if (checkIn.checkInDate) {
    return checkIn.checkInDate;
  }

  if (checkIn.updatedAt) {
    return getLocalDateKey(new Date(checkIn.updatedAt));
  }

  return null;
};

export const isLikertCheckInForToday = (
  checkIn: LikertCheckInDto | null | undefined
): boolean => {
  const checkInDate = getLikertCheckInDateKey(checkIn);
  if (!checkInDate) {
    return false;
  }

  return checkInDate === getLocalDateKey();
};

/** Returns today's check-in only; stale entries from prior days appear as null. */
export const resolveLikertCheckInForToday = (
  checkIn: LikertCheckInDto | null | undefined
): LikertCheckInDto | null => {
  if (!checkIn || !isLikertCheckInForToday(checkIn)) {
    return null;
  }

  return checkIn;
};
