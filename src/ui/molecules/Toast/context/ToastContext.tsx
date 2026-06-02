import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';
import { ToastItemProps } from '../Toast';

interface ToastContextContent {
  setToastList: Dispatch<SetStateAction<ToastItemProps[]>>;
  toastList: Array<ToastItemProps>;
}

export const Context = createContext<ToastContextContent>({
  setToastList: () => {},
  toastList: [],
});

interface ToastProviderProps {
  children: ReactNode;
  dismissTime?: number;
}

export const Provider = ({ children }: ToastProviderProps) => {
  const [toastList, setToastList] = useState<Array<ToastItemProps>>([]);
  return (
    <Context.Provider value={{ toastList, setToastList }}>
      {children}
    </Context.Provider>
  );
};
