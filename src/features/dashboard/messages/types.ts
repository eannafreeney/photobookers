import { Context, Env } from "hono";
import { createMessageFormSchema } from "./schema";
import { z } from "zod";
import { creatorIdSchema } from "../../../schemas";

export type MessageFormContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof creatorIdSchema>;
      form: z.infer<typeof createMessageFormSchema>;
    };
  }
>;
