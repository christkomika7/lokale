import Elysia from "elysia";
import { businessRoutes } from "./business";

export const workspaceRoute = new Elysia({ prefix: "/workspace" }).use(
  businessRoutes,
);
