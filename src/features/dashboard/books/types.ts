import { bookIdSchema } from "../../../schemas";
import { bookFormSchema } from "./schema";
import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";
import { Book } from "../../../db/schema";
import { BookWithRelations } from "../../../../types";

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
  Env & { Variables: { book: BookWithRelations } },
  string,
  { out: { form: z.infer<typeof bookFormSchema> } }
>;
