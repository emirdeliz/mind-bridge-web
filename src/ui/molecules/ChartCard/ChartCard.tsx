import { Flex, Icon, Title } from "@atoms";
import { ReactNode } from "react";
import { Tooltip } from "../Tooltip/Tooltip";

interface ChartCardProps {
  children: ReactNode;
  title: ReactNode;
  tooltip?: string;
}

export const ChartCard = ({ children, title, tooltip }: ChartCardProps) => (
  <div className="mb-chart-card">
    <Flex col alignCenter hFull wFull>
      <Flex row alignCenter justifyCenter gap2 mb4 wFull>
        <Title fw3 fs4 center>
          {title}
        </Title>
        {tooltip ? (
          <Tooltip title={tooltip} top width={300}>
            <span className="mb-tooltip-trigger">
              <Icon.InfoCircle sm />
            </span>
          </Tooltip>
        ) : null}
      </Flex>
      <div className="mb-chart-card-body">{children}</div>
    </Flex>
  </div>
);