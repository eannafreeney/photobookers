import { Context, Env } from "hono";
import { claimIdSchema } from "../../../../schemas";
import { z } from "zod";
import { claimFormSchema } from "./schema";

export type ClaimIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof claimIdSchema> } }
>;

export type ClaimApproveFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof claimFormSchema> } }
>;

export type ClaimRejectFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof claimFormSchema> } }
>;
