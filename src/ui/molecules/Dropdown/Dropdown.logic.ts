import { ReactNode } from "react";
import { GenericObject } from "@types";
import { accessAtributeObjectByPath } from "@helpers";
import { DropdownProps } from "./Dropdown";

export interface DropdownSelectedItemProps<T> {
  value?: T;
  label?: string;
  before?: ReactNode;
}

export const normalizeValue = <T extends GenericObject>({
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
    before: (value as T & { before?: ReactNode })?.before,
    label: keyOfLabelCompost
      ? String(accessAtributeObjectByPath(value as Record<string, unknown>, String(keyOfLabelCompost)) ?? "")
      : String((keyOfLabel && value ? value[keyOfLabel] : value) || ""),
  } as DropdownSelectedItemProps<T>;
};

export const getOptionsFiltered = <T extends GenericObject>(
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