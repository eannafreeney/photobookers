import { Context } from "hono";
import { Env } from "hono/types";
import { z } from "zod";
import { interviewFormSchema } from "./schema";

export type InterviewFormContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof interviewFormSchema>;
    };
  }
>;
