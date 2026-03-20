import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";
import { redirectUrlSchema } from "../../schemas";
import {
  loginFormSchema,
  processRegisterQuerySchema,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resetPasswordFormSchema,
} from "./schema";

export type LoginFormContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof loginFormSchema>;
      param: z.infer<typeof redirectUrlSchema>;
    };
  }
>;

export type RegisterFanFormContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof registerFanFormSchema>;
      param: z.infer<typeof redirectUrlSchema>;
    };
  }
>;

export type RegisterCreatorFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof registerCreatorFormSchema> } }
>;

export type ResetPasswordFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof resetPasswordFormSchema> } }
>;

export type ProcessRegisterQueryContext = Context<
  Env,
  string,
  { out: { query: z.infer<typeof processRegisterQuerySchema> } }
>;

//
