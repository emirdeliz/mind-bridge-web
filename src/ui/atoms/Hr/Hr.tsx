export interface HrProps {
  vertical?: boolean;
}

export const Hr = ({ vertical = false, ...props }: HrProps) => {
  const hrClasses = [
    'border-gray-300',
    vertical ? 'border-l h-full' : 'border-t w-full',
  ].join(' ');

  return <hr className={hrClasses} {...props} />;
};
