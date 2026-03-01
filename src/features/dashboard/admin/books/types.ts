import { bookFormSchema, bookIdSchema } from "../../../../schemas";
import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";

export type BookFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof bookFormSchema> } }
>;

export type BookFormWithBookIdContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof bookIdSchema>;
      form: z.infer<typeof bookFormSchema>;
    };
  }
>;
