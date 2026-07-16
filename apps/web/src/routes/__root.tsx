import {
  Outlet,
  HeadContent,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TooltipProvider } from "#/components/ui/tooltip";
import { ThemeProvider } from "#/components/theme/theme-provider";
import { BanBanner } from "#/components/alert/ban-banner";
import { Toaster } from "#/components/ui/sonner";
import { RealtimeProvider } from "#/components/realtime/realtime";
import { env } from "#/lib/env";
import type { RouterContext } from "#/types/context";

// import { useBanWatcher } from "#/hook/use-ban-watcher";

import "../globals.css";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      { title: "Lokale." },
      { name: "description", content: "Lokale. is a web application" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
});

function RootComponent() {
  // useBanWatcher();
  const { session } = Route.useRouteContext();

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        storageKey="vite-ui-theme"
      >
        <RealtimeProvider url={env.VITE_SERVER_HOST} enabled={!!session?.user}>
          <TooltipProvider>
            <div className="grid grid-rows-[auto_1fr] min-h-svh">
              <Toaster
                position="top-left"
                toastOptions={{
                  classNames: {
                    toast:
                      "border! border-neutral-200! dark:border-neutral-700! shadow-none rounded-[6px]!",
                    title: "text-sm font-medium",
                    description: "text-xs text-neutral-500",
                    default: "bg-white dark:bg-neutral-900",
                    success: "!border-emerald-200",
                    error: "!border-red-200",
                    warning: "!border-amber-200",
                  },
                }}
              />
              <BanBanner />
              <Outlet />
            </div>
          </TooltipProvider>
        </RealtimeProvider>
      </ThemeProvider>
      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
