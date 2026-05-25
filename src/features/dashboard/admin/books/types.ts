import { bookIdSchema } from "../../../../schemas";
import { bookFormAdminSchema } from "./schema";
import { z } from "zod";
import { Env } from "hono/types";
import { Context } from "hono";
import { Book, BookOfTheDay, Creator } from "../../../../db/schema";

export type BookWithAdminRelations = Book & {
  artist: Pick<Creator, "id" | "displayName" | "slug"> | null;
  publisher: Pick<Creator, "id" | "displayName" | "slug"> | null;
  bookOfTheDay?: BookOfTheDay | null;
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
