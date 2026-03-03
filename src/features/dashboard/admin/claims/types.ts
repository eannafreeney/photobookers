import { Context, Env } from "hono";
import { claimIdSchema } from "../../../../schemas";
import { z } from "zod";
import { claimApproveFormSchema, claimRejectFormSchema } from "./schema";

export type ClaimIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof claimIdSchema> } }
>;

export type ClaimApproveFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof claimApproveFormSchema> } }
>;

export type ClaimRejectFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof claimRejectFormSchema> } }
>;
