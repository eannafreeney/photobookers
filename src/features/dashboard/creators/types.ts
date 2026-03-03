import { creatorIdSchema } from "../../../schemas";
import { creatorFormSchema } from "./schema";
import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";
import { Creator } from "../../../db/schema";
import { bookFormSchema } from "../books/schema";

export type CreatorFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof creatorFormSchema> } }
>;

export type CreatorIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof creatorIdSchema> } }
>;

export type CreatorFormWithIdContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof creatorFormSchema>;
      param: z.infer<typeof creatorIdSchema>;
    };
  }
>;
