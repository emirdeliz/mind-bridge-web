import { Select, SelectProps } from '@atoms';
import { FormGroup } from '@molecules';

export interface SelectFormProps extends Omit<SelectProps, 'onChange'> {
  children: string;
  required?: boolean;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

export const SelectForm = ({
  value,
  children,
  onChange,
  ...props
}: SelectFormProps) => {
  const id = children ? children.replace(/\s/g, '_') : String(props.id);
  return (
    <FormGroup label={children} target={id} {...props}>
      <Select
        {...props}
        id={id}
        value={value}
        onChange={(e) => onChange && onChange(e)}
      />
    </FormGroup>
  );
};
