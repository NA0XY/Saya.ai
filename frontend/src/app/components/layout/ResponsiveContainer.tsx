import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: "content" | "wide" | "full";
};

export function ResponsiveContainer({ children, className = "", maxWidth = "content" }: ContainerProps) {
  const maxWidthClass = {
    content: "max-w-[1320px] 2xl:max-w-[1440px]",
    wide: "max-w-[1600px]",
    full: "max-w-full"
  }[maxWidth];

  return (
    <div className={`mx-auto px-20 xl:px-24 2xl:px-32 ${maxWidthClass} ${className}`}>
      {children}
    </div>
  );
}

export function FullBleed({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
}
