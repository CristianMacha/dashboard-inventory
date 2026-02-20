import { Outlet } from "react-router";
import { Boxes } from "lucide-react";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col gap-6 bg-primary text-primary-foreground p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary via-primary to-black/60 opacity-80" />
        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <Boxes strokeWidth={1.4} className="size-7" />
          <span>GI Backoffice</span>
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium leading-relaxed">
              "Manage your inventory, products, and operations — all in one
              place."
            </p>
            <footer className="text-sm text-primary-foreground/70">
              GI Platform
            </footer>
          </blockquote>
        </div>
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -top-20 -left-20 size-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Boxes strokeWidth={1.4} className="size-6" />
            <span className="font-semibold text-lg">GI Backoffice</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
