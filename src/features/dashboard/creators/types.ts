import { creatorFormSchema, creatorIdSchema } from "../../../schemas";
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

export type CreatorFormWithBookContext = Context<
  Env & { Variables: { creator: Creator } },
  string,
  { out: { form: z.infer<typeof bookFormSchema> } }
>;

export type CreatorIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof creatorIdSchema> } }
>;
