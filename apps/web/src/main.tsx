import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import Loader from "./components/ui/loader";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { authClient } from "./lib/auth-client";
import type { RouterContext } from "./types/context";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPendingComponent: () => <Loader />,
  context: { queryClient, session: null } satisfies RouterContext,
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function bootstrap() {
  const { data: session } = await authClient.getSession();

  router.update({
    context: {
      ...router.options.context,
      session,
    },
  });

  const rootElement = document.getElementById("app")!;
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<RouterProvider router={router} />);
  }
}

bootstrap();
