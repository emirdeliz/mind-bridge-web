type SidebarToggleIconProps = {
  direction: 'left' | 'right';
};

export const SidebarToggleIcon = ({ direction }: SidebarToggleIconProps) => (
  <svg
    className='mb-sidebar-toggle-icon'
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
    aria-hidden
  >
    <path
      d={direction === 'right' ? 'M6 4L10 8L6 12' : 'M10 4L6 8L10 12'}
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
