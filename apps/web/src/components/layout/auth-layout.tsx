import { type ReactNode } from "react";
import Logo from "../logo/logo";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "../ui/avatar";
import { initials } from "#/lib/utils";
import { StatusIndicator } from "../badge/status-indicator";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-neutral-900 relative overflow-hidden ">
      <div className="hidden lg:flex flex-col w-[50%] border-r border-neutral-100 dark:border-neutral-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-amber-100/70 dark:bg-amber-500/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-orange-50/80 dark:bg-amber-600/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[320px] rounded-full bg-amber-50/60 dark:bg-amber-500/3 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #E7B40E 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
        <div className="relative z-10 p-10">
          <Logo />
        </div>
        <div className="relative z-10 px-10 pb-6">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 leading-snug mb-3">
            {title}
          </h2>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-200 leading-relaxed max-w-sm">
            {subtitle}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              <AvatarGroup>
                {["PM", "JB", "AM", "RB"].map((init, i) => (
                  <Avatar key={i} className="size-8">
                    <AvatarImage src="/" />
                    <AvatarFallback className="bg-amber-50 dark:bg-amber-500 text-amber-500 dark:text-amber-50 font-bold text-sm">
                      {initials(init)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-200">
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                +14 923
              </span>{" "}
              utilisateurs actifs au Congo
            </p>
          </div>
        </div>
        <div className="relative z-10 flex-1 flex px-10">
          <div className="w-full max-w-[360px] space-y-4">
            <div className="rounded-3xl border border-amber-400 ring-3 ring-amber-500/30 bg-white/90 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="h-2.5 w-32 rounded-full bg-neutral-200 dark:bg-neutral-600 mb-2" />
                  <div className="h-2 w-20 rounded-full bg-neutral-200/60 dark:bg-neutral-700" />
                </div>
                <div className="size-10 rounded-2xl bg-amber-400/15 dark:bg-amber-400/10 flex items-center justify-center">
                  <div className="relative">
                    <StatusIndicator className="bg-amber-400 -translate-x-1/2 -translate-y-1/2 dark:border-neutral-700/30 dark:ring-neutral-700/30 dark:hover:ring-neutral-700/30 ring-1 ring-input group-hover:ring-amber-400 border border-white group-hover:border-amber-50 absolute top-1/2 left-1/2 size-4 rounded-full p-px" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="size-2 rounded-full bg-amber-400" />
                ))}
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 ml-2">
                  4.9 · 214 avis
                </span>
              </div>
              <div className="h-px bg-neutral-200/60 dark:bg-neutral-700 mb-4" />
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-neutral-200/60 dark:bg-neutral-700" />
                  <div className="h-2 w-4/5 rounded-full bg-neutral-200/60 dark:bg-neutral-700" />
                  <div className="h-2 w-3/5 rounded-full bg-neutral-200/60 dark:bg-neutral-700" />
                </div>
                <div className="size-10 rounded-lg bg-amber-200 dark:bg-amber-500/10 shrink-0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-amber-400 dark:bg-amber-400/15 border border-amber-400 ring-3 ring-amber-500/30 p-4 backdrop-blur-2xl">
                <p className="text-[10px] font-semibold text-amber-50 uppercase tracking-wider mb-1">
                  À proximité
                </p>
                <p className="text-2xl font-bold text-white leading-none">
                  1.2
                  <span className="text-sm font-medium ml-0.5 opacity-80">
                    km
                  </span>
                </p>
                <div className="mt-3 h-1 w-full rounded-full bg-amber-300/40 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-white" />
                </div>
              </div>

              <div className="rounded-2xl bg-white ring-3 ring-amber-500/30 dark:bg-neutral-800/30 border border-amber-400! dark:border-neutral-700/50 p-4">
                <p className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-500 uppercase tracking-wider mb-1">
                  Ouverts
                </p>
                <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 leading-none">
                  38
                  <span className="text-sm font-medium ml-0.5 text-neutral-500">
                    lieux
                  </span>
                </p>
                <div className="mt-3 flex gap-1">
                  {[60, 80, 45, 90, 70].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full h-2 bg-amber-500/30 dark:bg-amber-500/20"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-10">
          <Logo />
        </div>
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
