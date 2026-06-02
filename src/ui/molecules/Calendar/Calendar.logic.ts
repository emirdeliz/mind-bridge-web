import { checkingIfDateIsGreaterThanAnotherIgnoringTime } from '@helpers';

export const getCurrentData = (date: Date) => {
  const currentDate = new Date(date);
  currentDate.setDate(1);

  const firstDayOfWeek = currentDate.getDay();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  return { firstDayOfWeek, currentMonth, currentYear };
};

const daysInMonth = (month: number, year: number) => {
  return 32 - new Date(year, month, 32).getDate();
};

export const buildCalendarWeekDays = (
  dayOfMonth: number,
  currentDate: Date
) => {
  const result = [];
  const { currentMonth, currentYear, firstDayOfWeek } =
    getCurrentData(currentDate);
  let currentDay = dayOfMonth;

  for (let j = 0; j < 7; j += 1) {
    const restDaysOfWeek =
      dayOfMonth + j - daysInMonth(currentMonth, currentYear);
    if ((dayOfMonth === 0 && j < firstDayOfWeek) || restDaysOfWeek > -1) {
      result.push('');
    } else {
      result.push(++currentDay);
    }
  }
  return { result, dayOfMonth: currentDay };
};

export const buildCalendarWeek = (currentDate: Date) => {
  let dayOfMonth = 0;
  const result = [];
  for (let i = 0; i < 6; i += 1) {
    const { result: weekDays, dayOfMonth: daysCount } = buildCalendarWeekDays(
      dayOfMonth,
      currentDate
    );
    dayOfMonth = daysCount;

    const haveAtLeastOneDay = weekDays.filter((day) => !!day).length;
    if (haveAtLeastOneDay) {
      result.push(weekDays);
    }

    const { currentMonth, currentYear } = getCurrentData(currentDate);
    const restDaysOfMonth = daysInMonth(currentMonth, currentYear) - dayOfMonth;
    if (restDaysOfMonth < 0) {
      break;
    }
  }
  return result;
};

export const checkDisabledCurrentDay = (
  currentDate: Date,
  minDate?: Date,
  maxDate?: Date
) => {
  const isCurrentDateHigherThanMinDate =
    minDate &&
    checkingIfDateIsGreaterThanAnotherIgnoringTime(minDate, currentDate);

  const isMaxDateHigherThanCurrentDate =
    maxDate &&
    checkingIfDateIsGreaterThanAnotherIgnoringTime(currentDate, maxDate);
  return isCurrentDateHigherThanMinDate || isMaxDateHigherThanCurrentDate;
};
