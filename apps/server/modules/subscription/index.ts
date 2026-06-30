import Elysia from "elysia";
import { subscription } from "./subscripton";

export const subscriptionRoute = new Elysia().use(subscription);
