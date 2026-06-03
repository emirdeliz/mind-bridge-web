import { Flex, Title } from "@atoms";
import { ReactNode } from "react";

interface ChartCardProps { 
  children: ReactNode;
  title: ReactNode;
}

export const ChartCard = ({ children, title }: ChartCardProps) => (
  <div className="mb-chart-card">
    <Flex col alignCenter hFull wFull>
      <Title fw3 fs4 center mb4>
        {title}
      </Title>
      <div className="mb-chart-card-body">{children}</div>
    </Flex>
  </div>
);