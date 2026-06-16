import { Fragment } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface ResizablePanelProps {
  id: string;
  children: React.ReactNode;
  minSize?: number;
  maxSize?: number;
}

interface ResizablePanelsProps {
  children: Array<ResizablePanelProps>;
  direction?: 'horizontal' | 'vertical';
}

export const ResizablePanels = ({
  children,
  direction = 'horizontal',
}: ResizablePanelsProps) => {
  return (
    <PanelGroup direction={direction} autoSaveId='resizable-panels'>
      {children.map((child, index) => {
        const isLast = index === children.length - 1;
        const { children: childrenContent, minSize, maxSize, id } = child;
        return (
          <Fragment key={index}>
            <Panel
              minSize={minSize}
              maxSize={maxSize}
              id={id}
              order={index + 1}
              defaultSize={25}
            >
              {childrenContent}
            </Panel>
            {!isLast && <PanelResizeHandle />}
          </Fragment>
        );
      })}
    </PanelGroup>
  );
};
