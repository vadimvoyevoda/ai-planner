import * as React from "react";
import { cn } from "@/lib/utils";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div className={cn("flex h-screen w-64 flex-col border-r bg-background", className)} {...props}>
      {children}
    </div>
  );
}
