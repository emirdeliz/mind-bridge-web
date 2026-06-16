import { Checkbox, CheckboxProps } from '@atoms';
import { FormGroup, FormGroupProps } from '@molecules';
import { GenericObject } from '@types';

export interface CheckboxFormProps<T>
  extends
    Omit<CheckboxProps<T>, 'onChange' | 'label'>,
    Pick<
      FormGroupProps,
      'optional' | 'helpText' | 'error' | 'required' | 'fw3' | 'row'
    > {
  children: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const CheckboxForm = <T extends GenericObject>({
  checked,
  children,
  onChange,
  id,
  disabled,
  required,
  optional,
  error,
  helpText,
  fw3,
  row,
}: CheckboxFormProps<T>) => {
  const fieldId = id ?? children.replace(/\s/g, '_');

  return (
    <FormGroup
      required={required}
      optional={optional}
      error={error}
      helpText={helpText}
      fw3={fw3}
      row={row}
    >
      <Checkbox
        id={fieldId}
        label={children}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    </FormGroup>
  );
};
