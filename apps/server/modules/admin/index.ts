import Elysia from "elysia";
import { userRoute } from "./user";

export const adminRoute = new Elysia({ prefix: "/admin" }).use(userRoute);
