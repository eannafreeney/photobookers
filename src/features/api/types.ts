import { Context } from "hono";
import { Env } from "hono/types";
import { z } from "zod";
import {
  addCommentFormSchema,
  commentIdSchema,
  newsletterFormSchema,
} from "./schema";
import { bookIdSchema } from "../../schemas";
import { editCommentParamSchema } from "./schema";
import { BookComment } from "../../db/schema";

export type NewsletterFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof newsletterFormSchema> } }
>;

export type CreateCommentModalContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof bookIdSchema> } }
>;

export type AddCommentFormContext = Context<
  Env,
  string,
  {
    out: {
      form: z.infer<typeof addCommentFormSchema>;
      param: z.infer<typeof bookIdSchema>;
    };
  }
>;

export type UpdateCommentFormContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof editCommentParamSchema> &
        z.infer<typeof bookIdSchema>;
      form: z.infer<typeof addCommentFormSchema>;
    };
  }
>;

export type EditCommentFormContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof editCommentParamSchema> &
        z.infer<typeof bookIdSchema>;
      form: z.infer<typeof addCommentFormSchema>;
    };
  }
>;

export type DeleteCommentFormContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof commentIdSchema> } }
>;

type CommentVarsEnv = Env & {
  Variables: {
    comment: BookComment;
  };
};
export type UpdateCommentGuardedContext = Context<
  CommentVarsEnv,
  string,
  {
    out: {
      param: z.infer<typeof editCommentParamSchema> &
        z.infer<typeof bookIdSchema>;
      form: z.infer<typeof addCommentFormSchema>;
    };
  }
>;
export type DeleteCommentGuardedContext = Context<
  CommentVarsEnv,
  string,
  {
    out: {
      param: z.infer<typeof editCommentParamSchema> &
        z.infer<typeof bookIdSchema>;
    };
  }
>;
