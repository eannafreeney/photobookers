import { Context, Env } from "hono";
import { claimIdSchema } from "../../../../schemas";
import { z } from "zod";

export type ClaimIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof claimIdSchema> } }
>;
