import type { ComponentType } from "react";

/** Pass-through for Tooltip; full implementation in FloatingElement/FloatingElement.tsx */
export const withFloat = <T extends object>(Component: ComponentType<T>) => Component;
