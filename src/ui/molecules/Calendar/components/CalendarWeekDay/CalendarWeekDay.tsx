import React, { memo, useMemo } from 'react';
import { Flex, Title } from '@atoms';
import { filterDOMProps } from '@helpers';
import { checkDisabledCurrentDay } from '../../Calendar.logic';

interface CalendarWeekDayProps {
  minDate?: Date;
  maxDate?: Date;
  selectedDate?: Date;
  currentDate?: Date;
  values: Array<string | number>;
  onClick?: (value: string | number) => void;
}

export const CalendarWeekDay = memo(
  ({
    values,
    selectedDate,
    currentDate,
    minDate,
    maxDate,
    onClick,
  }: CalendarWeekDayProps) => {
    const isSelectedMonthAndYear = useMemo(() => {
      return (
        currentDate?.getMonth() === selectedDate?.getMonth() &&
        currentDate?.getFullYear() === selectedDate?.getFullYear()
      );
    }, [currentDate, selectedDate]);

    const isDisabledDay = (day: number | string) => {
      return (
        currentDate &&
        checkDisabledCurrentDay(
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            Number(day)
          ),
          minDate,
          maxDate
        )
      );
    };

    return (
      <>
        {values.map((day, index) => {
          const isSelected =
            day === selectedDate?.getDate() && isSelectedMonthAndYear;
          const disabledDay = !!day && isDisabledDay(day);

          const calendarWeekDayClasses = [
            'calendar-day',
            'flex items-center justify-center',
            'py-1 px-1',
            'text-center',
            'hover:bg-gray-50',
            'transition-colors duration-200',
            'min-h-[32px]',
            isSelected && 'selected',
            !onClick && 'bg-gray-100',
            onClick && !disabledDay && !!day && 'cursor-pointer',
            disabledDay && 'disabled',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              data-testid={`calendar-week-day-${day}`}
              key={index}
              className={calendarWeekDayClasses}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabledDay) {
                  onClick && onClick(day);
                }
              }}
            >
              <Title s1 uppercase white={isSelected} n2={!onClick}>
                {day}
              </Title>
            </div>
          );
        })}
      </>
    );
  }
);
