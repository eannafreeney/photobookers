import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";

import { redirectUrlSchema } from "../../schemas";
import {
  loginFormSchema,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resendVerificationFormSchema,
  resetPasswordFormSchema,
  validateEmailSchema,
  validateDisplayNameSchema,
  validateWebsiteSchema,
} from "./schema";

export type VerificationFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof resendVerificationFormSchema> } }
>;

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

export type ValidateEmailContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof validateEmailSchema> } }
>;

export type ValidateDisplayNameContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof validateDisplayNameSchema> } }
>;

export type ValidateWebsiteContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof validateWebsiteSchema> } }
>;
