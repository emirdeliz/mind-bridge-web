import { Icon } from '@atoms';
import { useI18n } from '@i18n';

interface InputSearchProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export const InputSearch = ({
  value,
  onChange,
  placeholder,
}: InputSearchProps) => {
  const { t } = useI18n();

  return (
    <div className='relative w-full'>
      <input
        className='mb-field input-focus-primary w-full pl-10 pr-4'
        placeholder={placeholder || t('SEARCH')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-mb-muted'>
        <Icon.Search xs />
      </div>
    </div>
  );
};
