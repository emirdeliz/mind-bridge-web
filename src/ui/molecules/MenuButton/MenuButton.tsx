import { ReactNode, memo, useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from '@hooks';

interface MenuButtonItemProps {
  label: ReactNode;
  onClick?: VoidFunction;
}

interface MenuButtonProps {
  children?: ReactNode;
  options: Array<MenuButtonItemProps>;
  dark?: boolean;
  top?: boolean;
}

export const MenuButton = memo(({ options, children, dark, top }: MenuButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { appendEventOutsideOnWindow } = useOnClickOutside();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && ref.current) {
      appendEventOutsideOnWindow(ref.current, () => {
        setIsOpen(false);
      });
    }
  }, [isOpen, appendEventOutsideOnWindow]);

  return (
    <div className="relative" ref={ref}>
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {children}
      </div>
      {isOpen && (
        <div className="absolute top-full right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[152px] py-1">
          {options.map((option, index) => {
            const isFirst = index === 0;
            const isLast = index === options.length - 1;
            const { label, onClick } = option;
            return (
              <div
                key={index}
                className={`cursor-pointer text-sm text-black px-3 py-2 hover:bg-gray-50 transition-colors duration-150 ${
                  isFirst ? 'rounded-t-lg' : ''
                } ${
                  isLast ? 'rounded-b-lg' : ''
                }`}
                onClick={() => {
                  setIsOpen(false);
                  onClick && onClick();
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
