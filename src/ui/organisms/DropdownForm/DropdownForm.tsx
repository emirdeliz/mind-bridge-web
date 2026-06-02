import React from 'react';
import { Dropdown, DropdownProps, FormGroup } from '@molecules';
import { GenericObject } from '@types';
import { filterDOMProps } from '@helpers';

export interface DropdownFormProps<T>
  extends Omit<DropdownProps<T>, 'onChange'> {
  children?: string;
  fw3?: boolean;
  required?: boolean;
  onBlur?: VoidFunction;
  onChange?: (
    item?: { value: T } & {
      hasError: boolean;
    }
  ) => void;
}

export const DropdownForm = <T extends GenericObject>({
  children,
  value,
  fw3,
  loading,
  hasLoadMore,
  keyOfLabel,
  keyOfLabelCompost,
  hasError,
  disabled,
  onChange,
  onBlur,
  onSearch,
  onLoadNewPage,
  onCustomRenderValue,
  onCustomRenderOption,
  options,
  allowWrap,
  ...props
}: DropdownFormProps<T>) => {
  const id = children ? children.replace(/\s/g, '_') : 'dropdown';
  const domProps = filterDOMProps(props);

  return (
    <FormGroup label={children} target={id} fw3={fw3} {...domProps}>
      <Dropdown<T>
        {...domProps}
        id={id}
        hasError={hasError}
        disabled={disabled}
        keyOfLabel={keyOfLabel}
        keyOfLabelCompost={keyOfLabelCompost}
        value={value}
        options={options}
        loading={loading}
        allowWrap={allowWrap}
        onSelect={(v: T | undefined) => {
          const hasError = !v;
          onChange && onChange({ value: v as T, hasError });
        }}
        onCustomRenderValue={onCustomRenderValue}
        onCustomRenderOption={onCustomRenderOption}
        onSearch={onSearch}
        hasLoadMore={hasLoadMore}
        onLoadNewPage={onLoadNewPage}
      />
    </FormGroup>
  );
};
