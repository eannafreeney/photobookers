import { creatorIdSchema } from "../../../../schemas";
import { manualAssignCreatorSchema, creatorFormAdminSchema } from "./schemas";
import { Context } from "hono";
import { Env } from "hono/types";
import { z } from "zod";

export type CreatorIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof creatorIdSchema> } }
>;

export type AssignOwnerContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof manualAssignCreatorSchema>;
      param: z.infer<typeof creatorIdSchema>;
    };
  }
>;

export type EditCreatorPageAdminContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof creatorIdSchema> } }
>;

export type CreateCreatorAdminContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof creatorFormAdminSchema> } }
>;

export type UpdateCreatorAdminContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof creatorFormAdminSchema>;
      param: z.infer<typeof creatorIdSchema>;
    };
  }
>;
