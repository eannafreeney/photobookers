import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { generateIssue } from "@/features/dashboard/admin/magazine/generate";
import { createDraftIssue } from "@/domain/magazine/mutations";
import {
  listAllIssuesForAdmin,
  listAllThemeLabels,
} from "@/domain/magazine/queries";
import { showErrorAlert } from "@/lib/alertHelpers";
import MagazineTable from "@/features/dashboard/admin/magazine/components/MagazineTable";
import Alert from "@/components/app/Alert";

// const LIST = "/dashboard/admin/magazine";

export const POST = createRoute(async (c: Context) => {
  const body = await c.req.parseBody();
  const seedRaw = typeof body.seed === "string" ? body.seed.trim() : "";
  const seed = seedRaw || null;

  const usedThemes = await listAllThemeLabels();
  const [genError, issue] = await generateIssue({ seed, usedThemes });
  if (genError) {
    return showErrorAlert(c, genError.reason);
  }

  const [saveError] = await createDraftIssue({
    title: issue.theme.title,
    subtitle: issue.theme.subtitle,
    kicker: issue.theme.kicker,
    theme: issue.theme.theme,
    editorsLetter: issue.theme.editorsLetter,
    generationSeed: seed,
    generationModel: issue.model,
    books: issue.books.map((b) => ({
      bookId: b.bookId,
      sortOrder: b.sortOrder,
      blurb: b.blurb,
      artistPrompt: b.artistPrompt ?? null,
    })),
  });
  if (saveError) {
    return showErrorAlert(c, saveError.reason);
  }

  const [error, issues] = await listAllIssuesForAdmin();
  if (error) {
    return showErrorAlert(c, error.reason);
  }

  return c.html(
    <>
      <MagazineTable issues={issues} />
      <Alert
        type="success"
        message={`Draft “${issue.theme.title}” generated with ${issue.books.length} books.`}
      />
    </>,
  );
});
