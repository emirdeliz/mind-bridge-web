import { Icon } from "@atoms";
import { useI18n } from "@i18n";

interface InputSearchProps { 
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export const InputSearch = ({ value, onChange, placeholder }: InputSearchProps) => {
  const { t } = useI18n();
  
  const containerClasses = [
    'relative w-full max-w-md',
  ].join(' ');

  const inputClasses = [
    'h-12', // Altura padronizada (48px)
    'min-h-[48px]', // Altura mínima garantida
    'w-full pl-10 pr-4 py-2',
    'bg-white border border-gray-300 rounded-lg',
    'text-gray-700 placeholder-gray-400',
    'input-focus-primary',
    'hover:border-gray-400',
    'transition-all duration-200',
  ].join(' ');

  const iconClasses = [
    'absolute inset-y-0 left-0 pl-3',
    'flex items-center pointer-events-none',
    'text-gray-400',
  ].join(' ');

  return (
    <div className={containerClasses}>
      <input 
        className={inputClasses}
        placeholder={placeholder || t('SEARCH')} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
      <div className={iconClasses}>
        <Icon.Search xs />
      </div>
    </div>
  );
};