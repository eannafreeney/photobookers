import type { Context } from "hono";
import type { z } from "zod";
import { Env } from "hono/types";
import type { fairFormAdminSchema, fairIdSchema, attendeeSchema } from "./schema";

export type FairFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof fairFormAdminSchema> } }
>;

export type FairFormWithIdContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof fairIdSchema>;
      form: z.infer<typeof fairFormAdminSchema>;
    };
  }
>;

export type FairIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof fairIdSchema> } }
>;

export type AttendeeFormContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof fairIdSchema>;
      form: z.infer<typeof attendeeSchema>;
    };
  }
>;
