import { z } from "zod";

export const magazineDetailsFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(300).optional(),
  editorsLetterTitle: z.string().max(200).optional(),
  editorsLetter: z.string().max(10000).optional(),
});

export type MagazineDetailsFormSchema = z.infer<
  typeof magazineDetailsFormSchema
>;

export const magazineBlurbFormSchema = z.object({
  blurb: z.string().max(2000).optional(),
});

export type MagazineBlurbFormSchema = z.infer<typeof magazineBlurbFormSchema>;

// The artist's answer/quote, pasted in by the admin to publish in the issue.
export const magazineArtistQuoteFormSchema = z.object({
  quote: z.string().max(2000).optional(),
});

export type MagazineArtistQuoteFormSchema = z.infer<
  typeof magazineArtistQuoteFormSchema
>;

// A book-scoped action (swap / regenerate blurb) — just the target book id.
export const magazineBookActionSchema = z.object({
  bookId: z.string().min(1),
});

export type MagazineBookActionSchema = z.infer<typeof magazineBookActionSchema>;

// Emailing an artist their prompt. The admin previews and edits the message in a
// modal before sending: `email` is the (editable, prefilled) recipient, `subject`
// the subject line, and `prompt` the (editable) AI question — the email body is
// rebuilt from it server-side. Empty email string is treated as absent.
export const magazineEmailArtistSchema = z.object({
  bookId: z.string().min(1),
  email: z
    .union([z.email("Enter a valid email"), z.literal("")])
    .optional(),
  subject: z.string().min(1, "Subject is required").max(300).optional(),
  prompt: z.string().min(1, "A question is required").max(2000).optional(),
});

export type MagazineEmailArtistSchema = z.infer<
  typeof magazineEmailArtistSchema
>;

// Client-side validation for the artist-email modal fields.
export const magazineArtistEmailFormSchema = z.object({
  email: z.email("Enter a valid email"),
  subject: z.string().min(1, "Subject is required").max(300),
  prompt: z.string().min(1, "A question is required").max(2000),
});

export type MagazineArtistEmailFormSchema = z.infer<
  typeof magazineArtistEmailFormSchema
>;

// Fetching the artist-email preview modal (GET) — just identifies the book.
export const magazineEmailArtistQuerySchema = z.object({
  bookId: z.string().min(1),
});

export type MagazineEmailArtistQuerySchema = z.infer<
  typeof magazineEmailArtistQuerySchema
>;
