import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  padding?: "sm" | "md" | "lg" | "xl";
  shadow?: "sm" | "md" | "lg" | "xl";
  border?: boolean;
  hover?: boolean;
  overflowHidden?: boolean;
}

export const Card = ({
  children,
  padding = "md",
  shadow = "md",
  border = true,
  hover = false,
  overflowHidden = false,
}: CardProps) => {
  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  const shadowClasses = {
    sm: "shadow-card",
    md: "shadow-card",
    lg: "shadow-card",
    xl: "shadow-card",
  };

  const cardClasses = [
    "flex w-full flex-col",
    "rounded-2xl",
    "bg-mb-surface/90",
    "backdrop-blur-xl",
    shadowClasses[shadow],
    paddingClasses[padding],
    border && "border border-mb-border/80",
    hover && "hover:border-mb-accent/30 hover:shadow-glow transition-all duration-300",
    "transition-all duration-200",
    overflowHidden && "overflow-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={cardClasses}>{children}</div>;
};
