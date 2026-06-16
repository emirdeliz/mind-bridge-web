import * as helpers from '@helpers';
import React, {
  ChangeEvent,
  ClipboardEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { filterInputDomProps } from '@helpers';
import { InputProps } from '../Input';

const INPUT_NUMBER_MAX_LENGTH_DEFAULT = 12;

/**
 * Formats a decimal value string, ensuring proper decimal place limits
 * @param value - The input value
 * @param decimalPlaces - Maximum decimal places allowed (default: 2)
 * @param maxValue - Maximum value allowed (optional)
 * @param allowNegative - Whether to allow negative values (default: false)
 * @returns Formatted decimal string
 */
const formatDecimalValue = (
  value: string,
  decimalPlaces: number = 2,
  maxValue?: number,
  allowNegative: boolean = false
): string => {
  // Convert comma to dot (Brazilian decimal separator)
  let formatted = value.replace(',', '.');

  // Check if value starts with minus sign
  const isNegative = allowNegative && formatted.startsWith('-');

  // Allow only digits and one decimal point (and minus sign if allowed)
  if (allowNegative) {
    // Remove all non-digit characters except dot and minus
    formatted = formatted.replace(/[^\d.-]/g, '');
    // Keep only the first minus sign and only if at the start
    if (isNegative) {
      formatted = '-' + formatted.replace(/-/g, '');
    } else {
      formatted = formatted.replace(/-/g, '');
    }
  } else {
    formatted = formatted.replace(/[^\d.]/g, '');
  }

  // Get the numeric part (without minus sign for processing)
  const numericPart = isNegative ? formatted.substring(1) : formatted;

  // Ensure only one decimal point
  const parts = numericPart.split('.');
  let processedNumeric = numericPart;
  if (parts.length > 2) {
    processedNumeric = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places
  const updatedParts = processedNumeric.split('.');
  if (updatedParts.length === 2 && updatedParts[1].length > decimalPlaces) {
    processedNumeric =
      updatedParts[0] + '.' + updatedParts[1].slice(0, decimalPlaces);
  }

  // Reconstruct with minus sign if negative
  formatted = isNegative ? '-' + processedNumeric : processedNumeric;

  // Check max value
  if (
    maxValue !== undefined &&
    formatted !== '' &&
    formatted !== '.' &&
    formatted !== '-' &&
    formatted !== '-.'
  ) {
    const numValue = parseFloat(formatted);
    if (!isNaN(numValue) && numValue > maxValue) {
      formatted = String(maxValue);
    }
  }

  return formatted;
};

export const InputNumber = ({
  value,
  maxLength,
  dataTestId,
  onChange,
  onPaste,
  onKeyDown,
  hasError,
  decimal,
  allowNegative,
  decimalPlaces = 2,
  maxValue,
  ...props
}: InputProps) => {
  const id = useMemo(() => String(props.id), [props.id]);

  // Internal state for decimal mode to preserve trailing dots/zeros while typing
  const [internalValue, setInternalValue] = useState<string>(
    String(value ?? '')
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal state when external value changes (but not while focused/typing)
  useEffect(() => {
    if (!isFocused && value !== undefined) {
      // Store internally with dot (will be displayed with comma)
      setInternalValue(String(value));
    }
  }, [value, isFocused]);

  const inputClasses = [
    'w-full',
    'h-12',
    'min-h-[48px]',
    'bg-white text-gray-900',
    'border border-gray-300',
    'outline-none rounded-lg',
    'px-4 py-3',
    'text-base',
    'font-sans',
    'transition-all duration-200 ease-in-out',
    'placeholder:text-gray-400 placeholder:font-normal',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'input-focus-primary',
    hasError &&
      'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200',
  ]
    .filter(Boolean)
    .join(' ');

  const processValue = (inputValue: string): string => {
    if (!inputValue) return '';

    if (decimal) {
      return formatDecimalValue(
        inputValue,
        decimalPlaces,
        maxValue,
        allowNegative
      );
    }

    // For non-decimal numbers, handle negative sign if allowed
    if (allowNegative) {
      const isNegative = inputValue.startsWith('-');
      const numericPart = helpers.getNumbersOfString(inputValue);
      return isNegative && numericPart ? '-' + numericPart : numericPart;
    }

    return helpers.getNumbersOfString(inputValue);
  };

  // Use internal value for display in decimal mode, external value otherwise
  // Display comma instead of dot for Brazilian format
  const displayValue = decimal
    ? internalValue.replace('.', ',')
    : String(value ?? '');

  const domProps = filterInputDomProps(props);

  return (
    <input
      {...domProps}
      id={id}
      value={displayValue}
      maxLength={maxLength || INPUT_NUMBER_MAX_LENGTH_DEFAULT}
      data-testid={dataTestId || ''}
      data-error={hasError ? 'true' : 'false'}
      className={inputClasses}
      onKeyDown={onKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const processedValue = processValue(e.target.value);

        // Update internal state for display
        if (decimal) {
          setInternalValue(processedValue);
        }

        const eventAsNumber = {
          ...e,
          target: {
            ...e?.target,
            value: processedValue,
          },
        } as ChangeEvent<HTMLInputElement>;

        if (onChange) {
          onChange(eventAsNumber);
        }
      }}
      onPaste={(e) => {
        if (!onPaste) {
          return;
        }
        e.preventDefault();
        const pastedData = e.clipboardData.getData('Text');
        const processedValue = processValue(pastedData);

        const evenPastAsNumber = {
          ...e,
          clipboardData: {
            ...e.clipboardData,
            getData: (_v: string) => processedValue,
          },
        };
        onPaste(evenPastAsNumber as ClipboardEvent);
      }}
    />
  );
};
