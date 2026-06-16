import {
  ComponentType,
  Suspense,
  createElement,
  lazy,
  useMemo,
  PropsWithRef,
  ReactNode,
  LazyExoticComponent,
} from 'react';
import { GenericObject } from '@types';
import { Loading } from '@atoms';

type ComponentProps<T> = PropsWithRef<T & { children?: ReactNode }>;

export interface LoaderComponentProps<T> {
  children: () => Promise<{ default: ComponentType<T> }>;
  props?: ComponentProps<T>;
}

export const LoaderComponent = <T extends GenericObject>({
  children,
  props,
}: LoaderComponentProps<T>) => {
  const Component = useMemo(
    () => lazy(children) as LazyExoticComponent<ComponentType<T>>,
    [children]
  );

  return (
    <Suspense fallback={<Loading.Global />}>
      {createElement(
        Component as unknown as ComponentType<Record<string, unknown>>,
        (props ?? {}) as Record<string, unknown>
      )}
    </Suspense>
  );
};
