import { type ReactNode } from 'react';

import { Button, Flex, Icon, Title } from '@atoms';
import { Tooltip } from '@molecules';

interface DashboardSectionTitleProps {
  title: string;
  tooltip: string;
  trailing?: ReactNode;
  onSave?: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
}

export const DashboardSectionTitle = ({
  title,
  tooltip,
  trailing,
  onSave,
  saveDisabled = false,
  saveLabel,
}: DashboardSectionTitleProps) => (
  <Flex row wFull alignCenter justifySpaceBetween wrap gap4 mb2>
    <Flex row alignCenter gap2>
      <Title fs3 fw3>
        {title}
      </Title>
      <Tooltip title={tooltip} top width={300}>
        <span className='mb-tooltip-trigger'>
          <Icon.InfoCircle sm />
        </span>
      </Tooltip>
    </Flex>
    {trailing || onSave ? (
      <Flex row alignCenter gap4>
        {trailing}
        {onSave ? (
          <Button
            type='button'
            xs
            sm
            circle
            variant='secondary'
            outlined
            clickable={!saveDisabled}
            title={saveLabel}
            onClick={onSave}
          >
            <Icon.Floppy sm />
          </Button>
        ) : null}
      </Flex>
    ) : null}
  </Flex>
);
