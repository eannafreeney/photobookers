import { bookIdSchema } from "../../../../schemas";
import { Context } from "hono";
import { Env } from "hono/types";
import { z } from "zod";
import {
  artistOfTheWeekFormSchema,
  bookOfTheWeekFormSchema,
  featuredBooksFormSchema,
  publisherOfTheWeekFormSchema,
  weekQuerySchema,
} from "./schema";

export type BOTWBookIdContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof bookIdSchema> } }
>;

export type BOTWFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof bookOfTheWeekFormSchema> } }
>;

export type BOTWFormWithBookIdContext = Context<
  Env,
  string,
  {
    out: {
      param: z.infer<typeof bookIdSchema>;
      form: z.infer<typeof bookOfTheWeekFormSchema>;
    };
  }
>;

export type FeaturedFormContext = Context<
  Env,
  string,
  {
    out: {
      query: z.infer<typeof weekQuerySchema>;
      form: z.infer<typeof featuredBooksFormSchema>;
    };
  }
>;

export type ArtistOfTheWeekFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof artistOfTheWeekFormSchema> } }
>;

export type PublisherOfTheWeekFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof publisherOfTheWeekFormSchema> } }
>;

export type PlannerWeekQueryContext = Context<
  Env,
  string,
  { out: { query: z.infer<typeof weekQuerySchema> } }
>;
