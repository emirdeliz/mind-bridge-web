/**
 * Strips design-system props before spreading onto native DOM elements.
 * Prevents React warnings like: Received `true` for a non-boolean attribute `phone`.
 */

export const omitProps = <T extends Record<string, unknown>>(
  props: T,
  keys: readonly string[]
): Partial<T> => {
  const omitted = new Set<string>(keys);
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !omitted.has(key))
  ) as Partial<T>;
};

/** Custom Input atom props — must not reach `<input>` / `<textarea>`. */
export const INPUT_CUSTOM_PROP_KEYS = [
  'rg',
  'cpf',
  'cnpj',
  'currency',
  'phone',
  'barcode',
  'number',
  'decimal',
  'allowNegative',
  'textarea',
  'date',
  'password',
  'digitsOnly',
  'transparent',
  'countryState',
  'alignCenter',
  'hasError',
  'dataTestId',
  'before',
  'after',
  'decimalPlaces',
  'maxValue',
  'm',
  'mt',
  'mr',
  'mb',
  'ml',
  'mx',
  'my',
  'p',
  'pt',
  'pr',
  'pb',
  'pl',
  'px',
  'py',
  'fontSize',
  // FormGroup / InputForm (shared via {...props} on <Input>)
  'helpText',
  'optional',
  'error',
  'fw3',
  'row',
  'label',
  'target',
  'labelId',
] as const;

/** Field props that must not leak onto `<label>` via FormGroup rest spread. */
export const FIELD_PROP_KEYS = [
  ...INPUT_CUSTOM_PROP_KEYS,
  'value',
  'onChange',
  'onBlur',
  'onPaste',
  'onKeyDown',
  'onClick',
  'placeholder',
  'autoComplete',
  'list',
  'type',
  'name',
  'maxLength',
  'minLength',
  'readOnly',
  'disabled',
  'required',
  'id',
  'rows',
  'helpText',
  'optional',
  'label',
  'target',
  'labelId',
  'error',
  'fw3',
  'row',
] as const;

export const LABEL_CUSTOM_PROP_KEYS = ['fw3', 'n2', 'fs3', 'error', 'target'] as const;

export const BUTTON_CUSTOM_PROP_KEYS = [
  'clickable',
  'disabled',
  'rounded',
  'outlined',
  'wFull',
  'link',
  'circle',
  'maxWidth',
  'minWidth',
  'variant',
  'xs',
  'sm',
  'nm',
  'lg',
  'xl',
  'm',
  'mt',
  'mr',
  'mb',
  'ml',
  'mx',
  'my',
  'default',
  'selected',
  'chip',
  'dataTestId',
] as const;

export const filterInputDomProps = <T extends object>(props: T): Partial<T> =>
  omitProps(props as Record<string, unknown>, INPUT_CUSTOM_PROP_KEYS) as Partial<T>;

/** FormGroup / DropdownForm — rest props forwarded to Label. */
export const filterDOMProps = <T extends object>(props: T): Partial<T> =>
  omitProps(props as Record<string, unknown>, FIELD_PROP_KEYS) as Partial<T>;

export const filterLabelDomProps = <T extends object>(props: T): Partial<T> =>
  omitProps(props as Record<string, unknown>, [
    ...FIELD_PROP_KEYS,
    ...LABEL_CUSTOM_PROP_KEYS,
  ]) as Partial<T>;

export const filterButtonDomProps = <T extends object>(props: T): Partial<T> =>
  omitProps(props as Record<string, unknown>, BUTTON_CUSTOM_PROP_KEYS) as Partial<T>;
