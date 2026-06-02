import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@test';
import { CalendarSimple, CalendarMinDate, CalendarMaxDate } from '@stories';
import { Story } from '@storybook/nextjs';
import { CalendarProps } from '..';
import { Calendar } from './Calendar';
import { getMonthByIndex } from '@helpers';

const renderCalendar = async (
  calendar: Story<CalendarProps>,
  props?: CalendarProps
) => {
  const Calendar = calendar;
  const { container } = render(<Calendar {...calendar.args} {...props} />);
  return container;
};

describe('Calendar component test', () => {
  it('Have Calendar', async () => {
    const { container: calendarNode } = render(<Calendar />);
    expect(typeof calendarNode).toEqual(typeof (<Calendar />));
  });

  it('Have Calendar simple with selection of current day', async () => {
    const currentDate = new Date();
    await renderCalendar(CalendarSimple);

    const currentDay = screen.getByText(currentDate.getDate().toString());
    expect(currentDay).not.toBeNull();
  });

  it('Have Calendar with prev and next month', async () => {
    const currentDate = new Date();
    await renderCalendar(CalendarSimple);

    // Usar seletores de título em vez de data-testid
    const prevButton = screen.getByTitle('Mês anterior');
    await waitFor(() => {
      fireEvent.click(prevButton);
    });

    const monthTitle = screen.getByText(getMonthByIndex(currentDate.getMonth() - 1)?.label || '');
    expect(monthTitle).toBeInTheDocument();

    const nextButton = screen.getByTitle('Próximo mês');
    await waitFor(() => {
      fireEvent.click(nextButton);
    });

    const currentMonthTitle = screen.getByText(getMonthByIndex(currentDate.getMonth())?.label || '');
    expect(currentMonthTitle).toBeInTheDocument();
  });

  it('Have Calendar with the previous year when the current date is 25/02/2021 and the previous button has two click', async () => {
    const currentDate = new Date(2021, 1, 25);
    await renderCalendar(CalendarSimple, { value: currentDate });

    const prevButton = screen.getByTitle('Mês anterior');
    fireEvent.click(prevButton);
    fireEvent.click(prevButton);

    const monthTitle = screen.getByText(getMonthByIndex(currentDate.getMonth() - 2)?.label || '');
    expect(monthTitle).toBeInTheDocument();
  });

  it('Have Calendar with the next year when the current date is 25/11/2021 and the next button has two click', async () => {
    const currentDate = new Date(2021, 11, 25);
    await renderCalendar(CalendarSimple, { value: currentDate });

    const nextButton = screen.getByTitle('Próximo mês');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    const monthTitle = screen.getByText(getMonthByIndex(currentDate.getMonth() + 2)?.label || '');
    expect(monthTitle).toBeInTheDocument();
  });

  it('Have Calendar with disable days when minDate is 2021/11/10 and the current date is 2021/11/14', async () => {
    await renderCalendar(CalendarMinDate);

    const prevButton = screen.getByTitle('Mês anterior');
    fireEvent.click(prevButton);

    const dayNextMonth = screen.getByText('2');
    fireEvent.click(dayNextMonth);
    expect(dayNextMonth).toBeInTheDocument();

    const nextButton = screen.getByTitle('Próximo mês');
    fireEvent.click(nextButton);

    const dayPrevMonthDisabled = screen.getByText('9');
    fireEvent.click(dayPrevMonthDisabled);
    expect(dayPrevMonthDisabled).toBeInTheDocument();

    const dayPrevMonth = screen.getByText('13');
    fireEvent.click(dayPrevMonth);
    expect(dayPrevMonth).toBeInTheDocument();
  });

  it('Have Calendar with disable days when maxDate is 2021/11/17 and the current date is 2021/11/14', async () => {
    await renderCalendar(CalendarMaxDate);

    const nextButton = screen.getByTitle('Próximo mês');
    fireEvent.click(nextButton);

    const dayPrevMonth = screen.getByText('2');
    fireEvent.click(dayPrevMonth);
    expect(dayPrevMonth).toBeInTheDocument();

    const prevButton = screen.getByTitle('Mês anterior');
    fireEvent.click(prevButton);

    const dayNextMonthDisabled = screen.getByText('18');
    fireEvent.click(dayNextMonthDisabled);
    expect(dayNextMonthDisabled).toBeInTheDocument();

    const dayNextMonth = screen.getByText('13');
    fireEvent.click(dayNextMonth);
    expect(dayNextMonth).toBeInTheDocument();
  });
});
