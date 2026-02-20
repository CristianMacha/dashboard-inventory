import { Suspense } from "react";
import type { ReactNode } from "react";
import { CustomFullScreenLoading } from "@/components/ui/custom/CustomFullScreenLoading";

export const PageSuspense = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<CustomFullScreenLoading />}>{children}</Suspense>
);
