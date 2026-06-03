import React, { ReactNode } from "react";

import { Title } from "@atoms";
import { buildMarginClasses, type MarginSpacingProps } from "../../atoms/shared/spacingClasses";

export interface FormErrorProps extends MarginSpacingProps {
  children: ReactNode;
  error?: string;
}

export const FormError = ({ children, error, ...marginProps }: FormErrorProps) => {
  const marginClasses = buildMarginClasses(marginProps);

  if (!error) {
    return <div className={`w-full ${marginClasses}`.trim()}>{children}</div>;
  }

  return (
    <div className={`w-full ${marginClasses}`.trim()}>
      {children}
      <Title s1 error mt2>
        {error}
      </Title>
    </div>
  );
};
