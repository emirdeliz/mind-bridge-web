import { useMemo } from 'react';

export interface SwitchProps {
  selected?: boolean;
  id?: string | number;
  disabled?: boolean;
  sm?: boolean;
	onChange?: (selected: boolean) => void;
}

export const Switch = ({ selected, onChange, disabled, sm, ...props }: SwitchProps) => {
	const id = useMemo(() => String(props.id), [props.id]);

  const switchClasses = [
    'relative shrink-0',
    sm ? 'h-5 w-9' : 'h-6 w-12',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
  ].join(' ');

  const sliderClasses = [
    'relative',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    'h-full w-full transition-all duration-500',
    'rounded-full',
    selected ? 'bg-mb-accent' : 'bg-mb-border',
  ].join(' ');

  const circleClasses = [
    'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md transition-all duration-200',
    sm ? 'h-3.5 w-3.5' : 'h-4 w-4',
    selected
      ? sm
        ? 'left-[calc(100%-0.875rem-2px)]'
        : 'left-[calc(100%-1rem-2px)]'
      : 'left-0.5',
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
