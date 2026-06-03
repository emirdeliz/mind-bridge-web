import { Flex, Title } from "@atoms";
import { ReactNode } from "react";

interface ChartCardProps { 
  children: ReactNode;
  title: ReactNode;
}

export const ChartCard = ({ children, title }: ChartCardProps) => { 
  const chartCardClasses = [
    'bg-white rounded-lg shadow-md p-6',
    'border border-gray-200',
    'w-full h-full',
    'min-h-[300px]',
  ].join(' ');

  return (
    <div className={chartCardClasses}>
      <Flex.Col alignCenter hFull>
        <Title fw3 fs4 center mb4>{title}</Title>
        <div className="flex-1 w-full">
          {children}
        </div>
      </Flex.Col>
    </div>
  );
}