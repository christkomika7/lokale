import { Elysia, Context } from "elysia";
import { auth } from "../lib/auth";

export const betterAuthPlugin = new Elysia().mount(auth.handler);
