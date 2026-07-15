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

export const magazineMovementFormSchema = z.object({
  kicker: z.string().min(1, "Kicker is required").max(120),
  lead: z.string().min(1, "Lead is required").max(200),
  title: z.string().min(1, "Title is required").max(200),
});

export type MagazineMovementFormSchema = z.infer<
  typeof magazineMovementFormSchema
>;

export const magazineBlurbFormSchema = z.object({
  blurb: z.string().max(2000).optional(),
});

export type MagazineBlurbFormSchema = z.infer<typeof magazineBlurbFormSchema>;

// A book-scoped action (swap / regenerate blurb) — just the target book id.
export const magazineBookActionSchema = z.object({
  bookId: z.string().min(1),
});

export type MagazineBookActionSchema = z.infer<typeof magazineBookActionSchema>;
