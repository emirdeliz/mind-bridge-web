import { useCallback, useContext, useEffect } from 'react';
import { ToastContext } from '@molecules';
import { ToastItemProps, TOAST_DEFAULT_DISMISS_SECONDS } from '../Toast';

interface ToastSimpleMessageProps
  extends Omit<ToastItemProps, 'error' | 'info' | 'warn' | 'success'> {}

export const useToast = () => {
  const { toastList, setToastList } = useContext(ToastContext);
  const showToast = useCallback(
    (toast: ToastItemProps) => {
      setToastList((previousValue) => {
        return [...previousValue, { ...toast, id: toast.id || generateId() }];
      });
    },
    [setToastList]
  );

  const showToastSuccess = useCallback(
    (props: ToastSimpleMessageProps) => {
      showToast({ ...props, type: 'success' });
    },
    [showToast]
  );

  const showToastInfo = useCallback(
    (props: ToastSimpleMessageProps) => {
      showToast({ ...props, type: 'info' });
    },
    [showToast]
  );

  const showToastWarn = useCallback(
    (props: ToastSimpleMessageProps) => {
      showToast({ ...props, type: 'warning' });
    },
    [showToast]
  );

  const showToastError = useCallback(
    (props: ToastSimpleMessageProps) => {
      showToast({ ...props, type: 'error' });
    },
    [showToast]
  );

  const removeToast = useCallback(
    (id?: string) => {
      const listToastUpdated = toastList.filter((e) => e.id !== id);
      setToastList(listToastUpdated);
    },
    [setToastList, toastList]
  );

  const generateId = () => {
    return Math.random().toString();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (toastList.length) {
        removeToast(toastList[0].id);
      }
    }, TOAST_DEFAULT_DISMISS_SECONDS * 1000);
    return () => {
      clearInterval(interval);
    };
  }, [removeToast, toastList]);

  return {
    showToast,
    showToastSuccess,
    showToastInfo,
    showToastWarn,
    showToastError,
    removeToast,
    toastList,
  };
};
