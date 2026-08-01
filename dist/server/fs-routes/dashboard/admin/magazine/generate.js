import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { generateIssue } from "../../../../features/dashboard/admin/magazine/generate.js";
import { createDraftIssue } from "../../../../domain/magazine/mutations.js";
import {
  listAllIssuesForAdmin,
  listAllThemeLabels
} from "../../../../domain/magazine/queries.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import MagazineTable from "../../../../features/dashboard/admin/magazine/components/MagazineTable.js";
import Alert from "../../../../components/app/Alert.js";
const POST = createRoute(async (c) => {
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
      artistPrompt: b.artistPrompt ?? null
    }))
  });
  if (saveError) {
    return showErrorAlert(c, saveError.reason);
  }
  const [error, issues] = await listAllIssuesForAdmin();
  if (error) {
    return showErrorAlert(c, error.reason);
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(MagazineTable, { issues }),
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Draft \u201C${issue.theme.title}\u201D generated with ${issue.books.length} books.`
        }
      )
    ] })
  );
});
export {
  POST
};
