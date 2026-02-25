import { bookFormSchema, bookIdSchema } from "../../../schemas";
import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";
import { Book } from "../../../db/schema";

export type BookFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof bookFormSchema> } }
>;

export type BookIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof bookIdSchema> } }
>;

export type BookFormWithBookContext = Context<
  Env & { Variables: { book: Book } },
  string,
  { out: { form: z.infer<typeof bookFormSchema> } }
>;
