import { applyMaskMaybe, InputProps } from '../Input';

export const InputReadOnly = ({
  dataTestId,
  value,
  cpf,
  cnpj,
  rg,
  phone,
  barcode,
  countryState,
  currency,
}: InputProps) => {
  const readOnlyClasses = [
    'mb-field',
    'flex w-full min-w-0 items-center',
    'cursor-default border-mb-border/60 bg-mb-bg/40 text-mb-muted',
    'opacity-100',
  ].join(' ');

  return (
    <div className={readOnlyClasses} data-testid={dataTestId || ''}>
      <span className='block min-w-0 truncate text-sm text-mb-muted'>
        {applyMaskMaybe(value, {
          cpf,
          cnpj,
          rg,
          phone,
          barcode,
          countryState,
          currency,
        })}
      </span>
    </div>
  );
};
