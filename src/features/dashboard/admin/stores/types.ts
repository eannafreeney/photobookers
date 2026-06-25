import type { Context } from "hono";
import type { z } from "zod";
import { Env } from "hono/types";
import type { storeFormAdminSchema, storeIdSchema } from "./schema";

export type StoreFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof storeFormAdminSchema> } }
>;

export type StoreFormWithIdContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof storeIdSchema>;
      form: z.infer<typeof storeFormAdminSchema>;
    };
  }
>;

export type StoreIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof storeIdSchema> } }
>;
