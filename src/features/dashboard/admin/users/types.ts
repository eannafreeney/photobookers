import { Env } from "hono/types";
import {
  magicLinkFormSchema,
  newUserFormAdminSchema,
  userIdSchema,
} from "../../../../schemas";
import { Context } from "hono";
import z from "zod";

export type UserFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof newUserFormAdminSchema> } }
>;

export type UserIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof userIdSchema> } }
>;

export type MagicLinkFormContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof magicLinkFormSchema>;
      param: z.infer<typeof userIdSchema>;
    };
  }
>;
