import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Fade, FloatingElement, Icon, Link } from '@atoms';
import { Calendar, CalendarProps } from '@molecules';
import { formatDateAsYYYYMMDD } from '@helpers';
import { useOnClickOutside } from '@hooks';
import { useI18n } from '@i18n';

export interface LinkCalendarProps extends CalendarProps {
  readOnly?: boolean;
  id?: string;
  hasError?: boolean;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  clearable?: boolean;
}

export const LinkCalendar = forwardRef<HTMLDivElement, LinkCalendarProps>(
  (
    {
      value,
      minDate,
      maxDate,
      readOnly,
      id,
      hasError,
      onChange,
      clearable,
      top: propTop,
      bottom: propBottom,
      left: propLeft,
      right: propRight,
      ...props
    },
    refLinkCalendar
  ) => {
    // Check if position props were explicitly passed
    const hasExplicitPosition =
      propTop !== undefined ||
      propBottom !== undefined ||
      propLeft !== undefined ||
      propRight !== undefined;
    const calendarRef = useRef<HTMLDivElement>(null);
    const [openCalendar, setOpenCalendar] = useState<boolean>(false);
    const [calendarPosition, setCalendarPosition] = useState<{
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
    }>({});
    const { t } = useI18n();
    const { appendEventOutsideOnWindow } = useOnClickOutside();

    const dateAsFormat = useMemo(() => {
      return value ? formatDateAsYYYYMMDD(value) : '';
    }, [value]);

    // Função para calcular a melhor posição do calendário
    const calculateOptimalPosition = useCallback(() => {
      if (!calendarRef.current) return {};

      const anchorRect = calendarRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Dimensões estimadas do calendário (320px de largura, 400px de altura)
      const calendarWidth = 320;
      const calendarHeight = 400;

      // Margem de segurança
      const margin = 20;

      // Verificar espaço disponível em cada direção
      const spaceRight = viewportWidth - anchorRect.right;
      const spaceLeft = anchorRect.left;
      const spaceBottom = viewportHeight - anchorRect.bottom;
      const spaceTop = anchorRect.top;

      // Determinar posição horizontal
      let horizontalPos: 'left' | 'right' | undefined;
      if (spaceRight >= calendarWidth + margin) {
        horizontalPos = 'right';
      } else if (spaceLeft >= calendarWidth + margin) {
        horizontalPos = 'left';
      }

      // Determinar posição vertical - PRIORIZAR TOP quando não há espaço embaixo
      let verticalPos: 'top' | 'bottom' | undefined;

      // Se há espaço suficiente embaixo, usar bottom
      if (spaceBottom >= calendarHeight + margin) {
        verticalPos = 'bottom';
      }
      // Se não há espaço embaixo, SEMPRE tentar usar top
      else if (spaceTop >= calendarHeight + margin) {
        verticalPos = 'top';
      }
      // Se não há espaço suficiente em nenhuma direção, usar a que tem mais espaço
      else {
        if (spaceTop > spaceBottom) {
          verticalPos = 'top';
        } else {
          verticalPos = 'bottom';
        }
      }

      // Se não há espaço suficiente horizontalmente, usar a que tem mais espaço
      if (!horizontalPos) {
        if (spaceRight > spaceLeft) {
          horizontalPos = 'right';
        } else {
          horizontalPos = 'left';
        }
      }

      return {
        top: verticalPos === 'top',
        bottom: verticalPos === 'bottom',
        left: horizontalPos === 'left',
        right: horizontalPos === 'right',
      };
    }, []);

    useEffect(() => {
      if (calendarRef.current) {
        appendEventOutsideOnWindow(calendarRef.current, () => {
          setOpenCalendar(false);
        });
      }
    }, [appendEventOutsideOnWindow, calendarRef]);

    // Calcular posição quando abrir o calendário
    const handleOpenCalendar = useCallback(() => {
      if (!readOnly) {
        // Use explicit position props if provided, otherwise calculate automatically
        if (hasExplicitPosition) {
          setCalendarPosition({
            top: propTop,
            bottom: propBottom,
            left: propLeft,
            right: propRight,
          });
        } else {
          const position = calculateOptimalPosition();
          setCalendarPosition(position);
        }
        setOpenCalendar(true);
      }
    }, [
      readOnly,
      calculateOptimalPosition,
      hasExplicitPosition,
      propTop,
      propBottom,
      propLeft,
      propRight,
    ]);

    useImperativeHandle(refLinkCalendar, () => {
      return calendarRef?.current as HTMLDivElement;
    }, []);

    // When readOnly, must look exactly like a disabled input
    const linkCalendarClasses = readOnly
      ? [
          'w-full',
          'h-12',
          'min-h-[48px]',
          'flex items-center gap-2',
          'outline-none rounded-lg',
          'px-4 py-3',
          'text-base',
          'font-sans',
          'border border-gray-300',
          'bg-gray-50',
          'text-gray-500',
          'cursor-not-allowed',
          '[&_*]:text-gray-500', // Force gray text on all children (Link)
        ].join(' ')
      : [
          'relative',
          'flex items-center gap-2',
          'link-calendar',
          'cursor-pointer',
          'transition-colors duration-200',
          hasError && 'error',
        ]
          .filter(Boolean)
          .join(' ');

    const iconContainerClasses = [
      'flex items-center justify-center',
      'text-green-700',
      'icon-container',
    ].join(' ');

    return (
      <div
        className={linkCalendarClasses}
        ref={calendarRef}
        id={id}
        onClick={handleOpenCalendar}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenCalendar();
          }
        }}
        tabIndex={readOnly ? -1 : 0}
        role='button'
        aria-label={t('SELECT_DATE')}
      >
        {!readOnly && (
          <div className={iconContainerClasses} onClick={handleOpenCalendar}>
            <Icon.Calendar sm />
          </div>
        )}
        <Link fs3={!readOnly} noWrap noUnderline role='link'>
          {dateAsFormat || (readOnly ? '' : t('SELECT'))}
        </Link>
        {clearable && value && !readOnly && (
          <div
            className='flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer ml-1'
            onClick={(e) => {
              e.stopPropagation();
              onChange && onChange(undefined as unknown as Date);
            }}
            role='button'
            aria-label={t('CLEAR')}
          >
            <Icon.Close sm />
          </div>
        )}
        {openCalendar && (
          <FloatingElement
            opened
            anchor={calendarRef?.current}
            {...calendarPosition}
          >
            <Fade>
              <Calendar
                minDate={minDate}
                maxDate={maxDate}
                onChange={(d) => {
                  setOpenCalendar(false);
                  onChange && onChange(d);
                }}
                value={value}
              />
            </Fade>
          </FloatingElement>
        )}
      </div>
    );
  }
);
