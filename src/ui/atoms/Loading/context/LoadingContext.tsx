import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';

interface LoadingContextContent {
  loadingIdStack: Array<string>;
  setLoadingIdStack: Dispatch<SetStateAction<string[]>>;
}

export const Context = createContext<LoadingContextContent>({
  loadingIdStack: [],
  setLoadingIdStack: () => '',
});

interface LoadingProviderProps {
  children: ReactNode;
}

export const Provider = ({ children }: LoadingProviderProps) => {
  const [loadingIdStack, setLoadingIdStack] = useState<Array<string>>([]);
  return (
    <Context.Provider
      value={{
        loadingIdStack,
        setLoadingIdStack,
      }}
    >
      {children}
    </Context.Provider>
  );
};
