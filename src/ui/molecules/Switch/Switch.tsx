import { useMemo } from 'react';

export interface SwitchProps {
  selected?: boolean;
  id?: string | number;
  disabled?: boolean;
	onChange?: (selected: boolean) => void;
}

export const Switch = ({ selected, onChange, disabled, ...props }: SwitchProps) => {
	const id = useMemo(() => String(props.id), [props.id]);

  const switchClasses = [
    'w-12 h-6',
    'relative',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
  ].join(' ');

  const sliderClasses = [
    'relative',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    'w-full h-full transition-all duration-500',
    'rounded-full',
    selected ? 'bg-primary-theme' : 'bg-gray-300',
  ].join(' ');

  const circleClasses = [
    'absolute top-1/2 -translate-y-1/2',
    'w-4 h-4 transition-all duration-200',
    'bg-white rounded-full shadow-md',
    selected ? 'left-7' : 'left-1',
  ].join(' ');

  return (
    <div
      role='switch'
			id={id}
      aria-checked={selected ? 'true' : 'false'}
      aria-disabled={disabled ? 'true' : 'false'}
			onClick={() => !disabled && onChange && onChange(!selected)}
      className={switchClasses}
    >
      <div className={sliderClasses}>
        <div className={circleClasses} />
      </div>
    </div>
  );
};
