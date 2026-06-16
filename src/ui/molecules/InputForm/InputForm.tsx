import { Input, InputProps } from '@atoms';
import { FormGroup, FormGroupProps } from '../FormGroup/FormGroup';

export interface InputFormProps
  extends
    Omit<InputProps, 'onChange'>,
    Pick<
      FormGroupProps,
      'optional' | 'helpText' | 'error' | 'required' | 'fw3' | 'row'
    > {
  children: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

export const InputForm = ({
  value,
  children,
  onChange,
  ...props
}: InputFormProps) => {
  const id = children ? children.replace(/\s/g, '_') : String(props.id);
  return (
    <FormGroup label={children} target={id} {...props}>
      <Input
        {...props}
        id={id}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </FormGroup>
  );
};
