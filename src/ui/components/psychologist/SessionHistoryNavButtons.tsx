import { Button, Flex, Icon } from '@atoms';
import { Tooltip } from '@molecules';

interface SessionHistoryNavButtonsProps {
  canGoOlder: boolean;
  canGoNewer: boolean;
  onGoOlder: () => void;
  onGoNewer: () => void;
  olderTooltip: string;
  newerTooltip: string;
}

export const SessionHistoryNavButtons = ({
  canGoOlder,
  canGoNewer,
  onGoOlder,
  onGoNewer,
  olderTooltip,
  newerTooltip,
}: SessionHistoryNavButtonsProps) => (
  <Flex row alignCenter gap2>
    <Tooltip title={olderTooltip} top width={280}>
      <span className='inline-block'>
        <Button
          type='button'
          xs
          sm
          circle
          variant='secondary'
          outlined
          clickable={canGoOlder}
          onClick={onGoOlder}
        >
          <Icon.LeftOpen sm />
        </Button>
      </span>
    </Tooltip>
    <Tooltip title={newerTooltip} top width={280}>
      <span className='inline-block'>
        <Button
          type='button'
          xs
          sm
          circle
          variant='secondary'
          outlined
          clickable={canGoNewer}
          onClick={onGoNewer}
        >
          <Icon.RightOpen sm />
        </Button>
      </span>
    </Tooltip>
  </Flex>
);
