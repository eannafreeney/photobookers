import { Context, Env } from "hono";
import { createMessageFormSchema } from "./schema";
import { z } from "zod";
import { creatorIdSchema, messageParamSchema } from "../../../schemas";

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

export type UpdateMessageFormContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof messageParamSchema>;
      form: z.infer<typeof createMessageFormSchema>;
    };
  }
>;
