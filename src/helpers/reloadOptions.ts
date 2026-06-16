export type ReloadOptions = {
  silent?: boolean;
};

export const shouldSilentReload = (
  options: ReloadOptions | undefined,
  hasCachedData: boolean
): boolean => {
  if (options?.silent === true) {
    return true;
  }
  if (options?.silent === false) {
    return false;
  }
  return hasCachedData;
};
