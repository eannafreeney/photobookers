import { z } from "zod";
const magazineDetailsFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(300).optional(),
  editorsLetter: z.string().max(1e4).optional()
});
const magazineBlurbFormSchema = z.object({
  blurb: z.string().max(2e3).optional()
});
const magazineArtistQuoteFormSchema = z.object({
  quote: z.string().max(2e3).optional()
});
const magazineBookActionSchema = z.object({
  bookId: z.string().min(1)
});
const magazineImageFormSchema = z.object({
  bookId: z.string().min(1),
  imageUrl: z.union([z.url("Enter a valid image URL"), z.literal("")]).optional()
});
const magazineMoveBookSchema = z.object({
  bookId: z.string().min(1),
  direction: z.enum(["up", "down"])
});
const magazineEmailArtistSchema = z.object({
  bookId: z.string().min(1),
  email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  subject: z.string().min(1, "Subject is required").max(300).optional(),
  prompt: z.string().min(1, "A question is required").max(2e3).optional(),
  // Optional ISO date (yyyy-mm-dd) for when this book goes live on Instagram;
  // formatted into the email's share kit. Empty when the admin leaves it blank.
  revealDate: z.string().max(40).optional()
});
const magazineArtistEmailFormSchema = z.object({
  email: z.email("Enter a valid email"),
  subject: z.string().min(1, "Subject is required").max(300),
  prompt: z.string().max(2e3).optional(),
  revealDate: z.string().max(40).optional()
});
const magazineEmailArtistQuerySchema = z.object({
  bookId: z.string().min(1)
});
export {
  magazineArtistEmailFormSchema,
  magazineArtistQuoteFormSchema,
  magazineBlurbFormSchema,
  magazineBookActionSchema,
  magazineDetailsFormSchema,
  magazineEmailArtistQuerySchema,
  magazineEmailArtistSchema,
  magazineImageFormSchema,
  magazineMoveBookSchema
};
