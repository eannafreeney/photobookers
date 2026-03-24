import { Context } from "hono";
import { Env } from "hono/types";
import { z } from "zod";
import { addCommentFormSchema, commentIdSchema, newsletterFormSchema } from "./schema";
import { bookIdSchema } from "../../schemas";

export type AddCommentFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof addCommentFormSchema>, param: z.infer<typeof bookIdSchema> } }
>;  

export type DeleteCommentFormContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof commentIdSchema> } }
>;  

export type NewsletterFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof newsletterFormSchema> } }
>;