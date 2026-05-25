import { Context } from "hono";
import { Env } from "hono/types";
import { z } from "zod";
import {
  artistOfTheWeekFormSchema,
  bookOfTheDayFormSchema,
  dateQuerySchema,
  publisherOfTheWeekFormSchema,
  sendBOTDCreatorEmailFormSchema,
  setEmailFormSchema,
  weekQuerySchema,
} from "./schema";

export type BOTDFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof bookOfTheDayFormSchema> } }
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

export type PlannerDateQueryContext = Context<
  Env,
  string,
  { out: { query: z.infer<typeof dateQuerySchema> } }
>;

export type SendBOTDCreatorEmailContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof sendBOTDCreatorEmailFormSchema> } }
>;

export type SetCreatorEmailContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof setEmailFormSchema> } }
>;
