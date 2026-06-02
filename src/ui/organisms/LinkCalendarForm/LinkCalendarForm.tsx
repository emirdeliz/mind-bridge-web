import { memo } from 'react';
import { LinkCalendar, LinkCalendarProps } from '../LinkCalendar/LinkCalendar';
import { FormGroup } from '@molecules';

export interface LinkCalendarFormProps extends LinkCalendarProps {
  children: string;
  value?: Date;
  required?: boolean;
  onChange?: (value: Date) => void;
}

export const LinkCalendarForm = memo(({
  value,
  children,
  onChange,
  ...props
}: LinkCalendarFormProps) => {
  const id = children ? children.replace(/\s/g, '_') : String(props.id);
  return (
    <FormGroup label={children} target={id} {...props}>
      <LinkCalendar {...props} value={value} onChange={onChange} />
    </FormGroup>
  );
});
