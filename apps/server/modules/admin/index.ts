import Elysia from "elysia";
import { userRoute } from "./user";
import { systemRoutes } from "./system";
import { countryRoutes } from "./country";
import { cityRoutes } from "./city";
import { currencyRoutes } from "./currency";
import { categoryRoutes } from "./category";

export const adminRoute = new Elysia({ prefix: "/admin" })
  .use(userRoute)
  .use(systemRoutes)
  .use(countryRoutes)
  .use(cityRoutes)
  .use(currencyRoutes)
  .use(categoryRoutes);
