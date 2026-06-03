import { Flex, Icon, Title } from "@atoms";
import { Tooltip } from "@molecules";

interface DashboardSectionTitleProps {
  title: string;
  tooltip: string;
}

export const DashboardSectionTitle = ({ title, tooltip }: DashboardSectionTitleProps) => (
  <Flex row alignCenter gap2 mb2>
    <Title fs3 fw3>
      {title}
    </Title>
    <Tooltip title={tooltip} top width={300}>
      <span className="mb-tooltip-trigger">
        <Icon.InfoCircle sm />
      </span>
    </Tooltip>
  </Flex>
);
