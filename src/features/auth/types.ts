import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";

import {
  loginFormSchema,
  redirectUrlSchema,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resendVerificationFormSchema,
} from "../../schemas";

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
