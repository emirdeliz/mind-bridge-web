import { Title } from "../../Title/Title";
import { applyMaskMaybe, InputProps } from "../Input";

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
  ...props
}: InputProps) => {
  const readOnlyClasses = [
    'flex items-center',
    'h-12', // Altura padronizada (48px)
    'min-h-[48px]', // Altura mínima garantida
    'px-4 py-3', // Padding padronizado (16px horizontal, 12px vertical)
    'bg-gray-100 text-gray-700',
    'border border-gray-200 rounded-md',
    'cursor-not-allowed',
  ].join(' ');

  return (
    <div className={readOnlyClasses} data-testid={dataTestId || ''}>
      <Title {...props} fs3 ellipsis>
        {applyMaskMaybe(value, {
          cpf,
          cnpj,
          rg,
          phone,
          barcode,
          countryState,
          currency,
        })}
      </Title>
    </div>
  );
}