import {
  Outlet,
  HeadContent,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TooltipProvider } from "#/components/ui/tooltip";
import { ThemeProvider } from "#/components/theme/theme-provider";

import "../globals.css";
import { BanBanner } from "#/components/alert/ban-banner";
import { useBanWatcher } from "#/hook/use-ban-watcher";
import type { RouterContext } from "#/types/context";
import { Toaster } from "#/components/ui/sonner";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Lokale.",
      },
      {
        name: "description",
        content: "Lokale. is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  // useBanWatcher();
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        storageKey="vite-ui-theme"
      >
        <TooltipProvider>
          <div className="grid grid-rows-[auto_1fr] min-h-svh">
            <Toaster />
            <BanBanner />
            <Outlet />
          </div>
        </TooltipProvider>
      </ThemeProvider>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
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
