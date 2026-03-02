import { bookIdSchema } from "../../../../schemas";
import { bookFormAdminSchema } from "./schema";
import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";
import { Book, BookOfTheWeek, Creator } from "../../../../db/schema";

export type BookWithAdminRelations = Book & {
  artist: Pick<Creator, "id" | "displayName" | "slug"> | null;
  publisher: Pick<Creator, "id" | "displayName" | "slug"> | null;
  bookOfTheWeekEntry?: BookOfTheWeek | null;
};

export type BookFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof bookFormAdminSchema> } }
>;

export type BookFormWithBookIdContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof bookIdSchema>;
      form: z.infer<typeof bookFormAdminSchema>;
    };
  }
>;
