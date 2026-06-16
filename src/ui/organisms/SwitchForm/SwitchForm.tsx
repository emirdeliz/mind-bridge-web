import { Input, InputProps } from '@atoms';
import { FormGroup, Switch, SwitchProps } from '@molecules';
import { ChangeEvent } from 'react';

export interface SwitchFormProps extends SwitchProps {
  children?: string;
  errorMsg?: string;
  id?: string;
  fw3?: boolean;
  row?: boolean;
}

export const SwitchForm = ({
  children,
  fw3,
  errorMsg,
  row,
  ...props
}: SwitchFormProps) => {
  const id = children ? children.replace(/\s/g, '_') : String(props.id);
  return (
    <FormGroup row={row} label={children} target={id} fw3={fw3} {...props}>
      <Switch id={id} {...props} />
    </FormGroup>
  );
};

export interface SwitchFormInputProps
  extends SwitchFormProps, Omit<InputProps, 'onChange' | 'id'> {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
