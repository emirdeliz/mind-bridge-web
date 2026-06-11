import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { filterInputDomProps } from '@helpers';
import { applyMaskMaybe, InputProps } from '../Input';

const INPUT_CURRENCY_MAX_LENGTH_DEFAULT = 16;

const toEditableAmount = (value: InputProps['value']): number | '' => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return '';
  }

  return numeric;
};

const parseCurrencyInputToAmount = (rawValue: string): number | '' => {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  return parseInt(digits, 10) / 100;
};

export const InputCurrency = ({
  maxLength,
  dataTestId,
  onChange,
  onKeyDown,
  hasError,
  ...props
}: InputProps) => {
  const [valueAsString, setValueAsString] = useState<number | ''>(
    () => toEditableAmount(props.value),
  );
  const lastExternalValue = useRef(props.value);
  const id = useMemo(() => String(props.id), [props.id]);
  const value = useMemo(
    () => applyMaskMaybe(valueAsString, { currency: true }),
    [valueAsString],
  );

  useEffect(() => {
    if (props.value === lastExternalValue.current) {
      return;
    }

    lastExternalValue.current = props.value;
    setValueAsString(toEditableAmount(props.value));
  }, [props.value]);

  const inputClasses = [
    'mb-field block w-full min-w-0',
    'input-focus-primary',
    hasError && 'mb-field-error',
  ].filter(Boolean).join(' ');

  const domProps = filterInputDomProps(props);

  return (
    <input
      {...domProps}
      id={id}
      value={value}
      maxLength={maxLength || INPUT_CURRENCY_MAX_LENGTH_DEFAULT}
      data-testid={dataTestId || ''}
      className={inputClasses}
      onKeyDown={onKeyDown}
      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValueAsString(parseCurrencyInputToAmount(e.target.value));
      }}
      onBlur={(e) => {
        const numericValue = parseCurrencyInputToAmount(e.target.value);
        lastExternalValue.current = numericValue === '' ? '' : numericValue;

        const eventAsNumber = {
          ...e,
          target: {
            ...e?.target,
            value: numericValue === '' ? '' : numericValue,
          },
        } as ChangeEvent<HTMLInputElement>;

        onChange && onChange(eventAsNumber);
      }}
    />
  );
};
