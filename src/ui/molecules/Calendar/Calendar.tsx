import React, { useMemo, useState } from 'react';
import { CalendarHeader, CalendarWeekDay } from './components';
import { Flex } from '@atoms';
import { applyCorrectDateByLimitOfDaysOnMonth, WeekLabel } from '@helpers';
import { buildCalendarWeek } from './Calendar.logic';

export const CALENDAR_DAY_WIDTH = '36px';

export interface CalendarProps {
  value?: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (value: Date) => void;
}

export const Calendar = ({
  value = new Date(),
  minDate,
  maxDate,
  onChange,
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const calendarDays = useMemo(() => {
    const days = buildCalendarWeek(currentDate);

    return days.map((week, index) => {
      return (
        <div key={index} className='grid grid-cols-7 gap-0'>
          <CalendarWeekDay
            values={week}
            selectedDate={value ? new Date(value) : new Date()}
            currentDate={currentDate}
            minDate={minDate}
            maxDate={maxDate}
            onClick={(v) => {
              const newDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                Number(v),
                23,
                59,
                59
              );
              onChange && onChange(newDate);
            }}
          />
        </div>
      );
    });
  }, [currentDate, value, minDate, maxDate, onChange]);

  const weekLabel = useMemo(() => {
    return Object.values(WeekLabel).map((label) => label[0]);
  }, []);

  const renderWeekDays = () => {
    return (
      <div className='grid grid-cols-7 gap-0 pb-2 mb-2'>
        {weekLabel.map((day, index) => (
          <div
            key={index}
            className='calendar-weekday-header text-center py-2 px-1'
          >
            <span className='text-xs font-medium text-gray-600 uppercase tracking-wide'>
              {day}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const changeMonth = (monthBase: number) => {
    const newDate = applyCorrectDateByLimitOfDaysOnMonth(currentDate, {
      month: monthBase,
    });
    setCurrentDate(newDate);
  };

  const changeYear = (yearBase: number) => {
    const newDate = new Date(yearBase, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
  };

  const calendarClasses = [
    'calendar-container',
    'bg-white rounded-lg shadow-lg',
    'border border-gray-200',
    'p-3',
    'w-full max-w-xs',
  ].join(' ');

  return (
    <div className={calendarClasses}>
      <CalendarHeader
        onChangeMonth={(m) => changeMonth(m)}
        onChangeYear={(y) => changeYear(y)}
      >
        {`${currentDate.getMonth()} ${currentDate.getFullYear()}`}
      </CalendarHeader>
      {renderWeekDays()}
      {calendarDays}
    </div>
  );
};
