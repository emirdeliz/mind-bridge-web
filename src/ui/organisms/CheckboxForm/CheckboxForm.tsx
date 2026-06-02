import { Checkbox, CheckboxProps } from '@atoms';
import { FormGroup } from '@molecules';
import { GenericObject } from '@types';

export interface CheckboxFormProps<T> extends Omit<CheckboxProps<T>, 'onChange'> {
  children: string;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const CheckboxForm = <T extends GenericObject> ({
  checked,
  children,
  onChange,
  ...props
}: CheckboxFormProps<T>) => {
  const id = children ? children.replace(/\s/g, '_') : String(props.id);
  
  return (
    <FormGroup target={id} {...props}>
      <Checkbox
        label={children}
        {...props}
        id={id}
        checked={checked}
        onChange={(e) => onChange && onChange(e)}
      />
    </FormGroup>
  );
};