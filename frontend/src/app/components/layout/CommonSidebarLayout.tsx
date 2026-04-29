import type { CSSProperties, ReactNode } from "react";
import { SidebarNav } from "../dashboard/SidebarNav";

type CommonSidebarLayoutProps = {
  children: ReactNode;
  pageClassName?: string;
  contentClassName?: string;
  pageStyle?: CSSProperties;
};

export function CommonSidebarLayout({
  children,
  pageClassName,
  contentClassName,
  pageStyle,
}: CommonSidebarLayoutProps) {
  return (
    <div className={pageClassName} style={pageStyle}>
      <SidebarNav />
      <div className="w-full lg:pl-64">
        <main className={contentClassName}>{children}</main>
      </div>
    </div>
  );
}
