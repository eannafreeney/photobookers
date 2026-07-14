import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { generateIssue } from "@/features/dashboard/admin/magazine/generate";
import { createDraftIssue } from "@/domain/magazine/mutations";
import { listAllThemeLabels } from "@/domain/magazine/queries";
import { setFlash } from "@/utils";

const LIST = "/dashboard/admin/magazine";

export const POST = createRoute(async (c: Context) => {
  const body = await c.req.parseBody();
  const seedRaw = typeof body.seed === "string" ? body.seed.trim() : "";
  const seed = seedRaw || null;

  const usedThemes = await listAllThemeLabels();
  const [genError, issue] = await generateIssue({ seed, usedThemes });
  if (genError) {
    await setFlash(c, "danger", genError.reason);
    return c.redirect(LIST, 303);
  }

  const [saveError, saved] = await createDraftIssue({
    title: issue.theme.title,
    subtitle: issue.theme.subtitle,
    kicker: issue.theme.kicker,
    theme: issue.theme.theme,
    editorsLetterTitle: issue.theme.editorsLetterTitle,
    editorsLetter: issue.theme.editorsLetter,
    movements: issue.movements,
    generationSeed: seed,
    generationModel: issue.model,
    books: issue.books.map((b) => ({
      bookId: b.bookId,
      movementId: b.movementId,
      sortOrder: b.sortOrder,
      blurb: b.blurb,
      artistPrompt: b.artistPrompt ?? null,
    })),
  });
  if (saveError) {
    await setFlash(c, "danger", saveError.reason);
    return c.redirect(LIST, 303);
  }

  await setFlash(
    c,
    "success",
    `Draft “${issue.theme.title}” generated with ${issue.books.length} books.`,
  );
  return c.redirect(`${LIST}/${saved.id}`, 303);
});
