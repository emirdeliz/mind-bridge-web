import React from 'react';
import { Flex } from '..';

export interface TabItemProps {
  id: string;
  title: string;
  active: boolean;
}

export interface TabsProps {
  tabs: Array<TabItemProps>;
  onClick: (tab: TabItemProps) => void;
}

export const Tabs = ({ tabs, onClick }: TabsProps) => {
  return (
    <Flex row>
      {tabs.map((tab: TabItemProps) => (
        <div
          key={tab.id}
          className={`px-4 py-2 cursor-pointer border-b-2 transition-colors duration-200 ${
            tab.active
              ? 'border-primary-theme text-primary-theme'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => onClick(tab)}
        >
          <div
            className={`font-medium ${tab.active ? 'text-primary-theme' : 'text-gray-600'}`}
          >
            {tab.title}
          </div>
        </div>
      ))}
    </Flex>
  );
};
