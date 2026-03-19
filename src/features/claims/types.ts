import { Context, Env } from "hono";
import { creatorIdSchema, currentPathSchema } from "../../schemas";
import { z } from "zod";
import { claimFormSchema, registerAndClaimFormSchema } from "./schema";

export type ClaimModalContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof creatorIdSchema>;
      query: z.infer<typeof currentPathSchema>;
    };
  }
>;

export type ProcessClaimContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof claimFormSchema>;
      param: z.infer<typeof creatorIdSchema>;
    };
  }
>;

export type RegisterAndClaimFormContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof registerAndClaimFormSchema>;
      param: z.infer<typeof creatorIdSchema>;
    };
  }
>;
