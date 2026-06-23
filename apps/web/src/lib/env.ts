import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  runtimeEnv: import.meta.env,
  client: {
    VITE_SERVER_HOST: z.url({ error: "L'url du serveur est requis" }),
  },
  clientPrefix: "VITE",
  emptyStringAsUndefined: true,
});
