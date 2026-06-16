import React, { memo, useCallback, useMemo } from 'react';
import { Title } from '@atoms';
import { getMonthByIndex } from '@helpers';
import { Icon } from '@atoms';

interface CalendarHeaderProps {
  children: string;
  onChangeMonth: (month: number) => void;
  onChangeYear?: (year: number) => void;
}

export const CalendarHeader = memo(
  ({ children, onChangeMonth, onChangeYear }: CalendarHeaderProps) => {
    const [currentMonth, currentYear] = useMemo(() => {
      const [month, year] = children.split(' ');
      return [Number(month), Number(year)];
    }, [children]);

    const getCurrentMonth = useCallback(() => {
      return getMonthByIndex(currentMonth)?.label;
    }, [currentMonth]);

    const handlePrevMonth = useCallback(() => {
      onChangeMonth(currentMonth - 1);
    }, [currentMonth, onChangeMonth]);

    const handleNextMonth = useCallback(() => {
      onChangeMonth(currentMonth + 1);
    }, [currentMonth, onChangeMonth]);

    const handlePrevYear = useCallback(() => {
      if (onChangeYear) {
        onChangeYear(currentYear - 1);
      }
    }, [currentYear, onChangeYear]);

    const handleNextYear = useCallback(() => {
      if (onChangeYear) {
        onChangeYear(currentYear + 1);
      }
    }, [currentYear, onChangeYear]);

    return (
      <div className='calendar-header'>
        {/* Navegação por ano */}
        <div className='flex items-center justify-between mb-3'>
          <button
            onClick={handlePrevYear}
            className='calendar-nav-button year-nav p-2 rounded-lg hover:bg-gray-100 transition-all duration-200'
            title='Ano anterior'
          >
            <div className='flex items-center -space-x-1'>
              <Icon.LeftOpen sm />
              <Icon.LeftOpen sm />
            </div>
          </button>

          <span className='text-lg font-semibold text-gray-700 px-4 py-2 bg-gray-50 rounded-lg'>
            {currentYear}
          </span>

          <button
            onClick={handleNextYear}
            className='calendar-nav-button year-nav p-2 rounded-lg hover:bg-gray-100 transition-all duration-200'
            title='Próximo ano'
          >
            <div className='flex items-center -space-x-1'>
              <Icon.RightOpen sm />
              <Icon.RightOpen sm />
            </div>
          </button>
        </div>

        {/* Navegação por mês */}
        <div className='flex items-center justify-between'>
          <button
            onClick={handlePrevMonth}
            className='calendar-nav-button month-nav p-3 rounded-xl hover:bg-primary-theme-50 hover:text-primary-theme transition-all duration-200'
            title='Mês anterior'
          >
            <Icon.LeftOpen sm />
          </button>

          <div className='text-center'>
            <h3 className='text-xl font-bold text-gray-800 capitalize'>
              {getCurrentMonth()}
            </h3>
          </div>

          <button
            onClick={handleNextMonth}
            className='calendar-nav-button month-nav p-3 rounded-xl hover:bg-primary-theme-50 hover:text-primary-theme transition-all duration-200'
            title='Próximo mês'
          >
            <Icon.RightOpen sm />
          </button>
        </div>
      </div>
    );
  }
);
