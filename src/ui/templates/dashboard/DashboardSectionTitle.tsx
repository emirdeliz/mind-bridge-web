import { Button, Flex, Icon, Title } from "@atoms";
import { Tooltip } from "@molecules";

interface DashboardSectionTitleProps {
  title: string;
  tooltip: string;
  onSave?: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
}

export const DashboardSectionTitle = ({
  title,
  tooltip,
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
        <span className="mb-tooltip-trigger">
          <Icon.InfoCircle sm />
        </span>
      </Tooltip>
    </Flex>
    {onSave ? (
      <Button
        type="button"
        xs
        sm
        circle
        variant="secondary"
        outlined
        clickable={!saveDisabled}
        title={saveLabel}
        onClick={onSave}
      >
        <Icon.Floppy sm />
      </Button>
    ) : null}
  </Flex>
);
