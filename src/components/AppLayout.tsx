import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import { BottomTabBar } from "./BottomTabBar";

export function AppLayout({
  children,
  title,
  hideHeader,
  hideTabBar,
}: {
  children: ReactNode;
  hideTabBar?: boolean;
  hideContact?: boolean;
  hideHeader?: boolean;
  title?: string;
}) {
  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div className="mx-auto w-full max-w-[760px] min-h-screen bg-background relative shadow-sm flex flex-col">
        {title && <PageHeader title={title} />}
        <div className="flex-1">{children}</div>
        {!hideTabBar && <BottomTabBar />}
      </div>
    </div>
  );
}
