import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`pb-4 mb-4 ${className}`}
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}
