'use client';

import { Icon } from '@atoms';
import { MOBILE_MAX_WIDTH_QUERY, useMatchMedia } from '@hooks';
import { useI18n } from '@i18n';

import { useMobileSidebarNavOptional } from './MobileSidebarNavContext';

type MobileSidebarTriggerProps = {
  expandLabelKey: string;
};

export const MobileSidebarTrigger = ({ expandLabelKey }: MobileSidebarTriggerProps) => {
  const { t } = useI18n();
  const isMobile = useMatchMedia(MOBILE_MAX_WIDTH_QUERY);
  const nav = useMobileSidebarNavOptional();

  if (!isMobile || !nav) {
    return null;
  }

  return (
    <button
      type='button'
      className='mb-sidebar-toggle shrink-0'
      aria-label={t(expandLabelKey)}
      aria-expanded={nav.isOpen}
      onClick={nav.open}
    >
      <Icon.Menu sm />
    </button>
  );
};
