// Page-width wrapper. Use inside <header>/<main>/<footer> for consistent gutters.
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("max-w-[1200px] mx-auto px-6", className)}>{children}</div>;
}
