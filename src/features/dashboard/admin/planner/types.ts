import { bookIdSchema } from "../../../../schemas";
import { Context } from "hono";
import { Env } from "hono/types";
import { z } from "zod";
import { bookOfTheWeekFormSchema } from "./schema";

export type BOTWBookIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof bookIdSchema> } }
>;

export type BOTWFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof bookOfTheWeekFormSchema> } }
>;

export type BOTWFormWithBookIdContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof bookIdSchema>;
      form: z.infer<typeof bookOfTheWeekFormSchema>;
    };
  }
>;
