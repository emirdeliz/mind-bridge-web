export interface FormControl {
  value?: string | number | Date | boolean | undefined | null;
  required?: boolean;
  hasError?: boolean;
  disabled?: boolean;
}
