import { ReactNode } from 'react';
import { DropdownOptionProps, DropdownProps } from '..';
import { accessAtributeObjectByPath } from '@helpers';

export interface DropdownSelectedItemProps<T> {
  value?: T;
  label?: string;
  before?: ReactNode;
}

export const normalizeValue = <T>({
  value,
  keyOfLabel,
  keyOfLabelCompost,
}: DropdownProps<T>):
  | DropdownSelectedItemProps<T>
  | Array<DropdownSelectedItemProps<T>> => {
  
  if (Array.isArray(value)) {
    return value.map((item) =>
      normalizeValue({
        value: item,
        keyOfLabel,
        keyOfLabelCompost
      } as DropdownProps<T>)
    ) as Array<DropdownSelectedItemProps<T>>;
  }

  return {
    value: value,
    before: (value as DropdownOptionProps<T>)?.before,
    label: keyOfLabelCompost ? accessAtributeObjectByPath<T>(value, [keyOfLabelCompost])[0] :
      String((keyOfLabel && value ? value[keyOfLabel] : value) || ''),
  } as DropdownSelectedItemProps<T>;
};

export const getOptionsFiltered = <T>(
	options: Array<DropdownSelectedItemProps<T>>,
  filter?: string
) => {
  return options.filter((opt) => {
    return (
      !filter ||
      String(opt.label || '')
        .toLowerCase()
        .includes(filter.toLowerCase())
    );
  });
};