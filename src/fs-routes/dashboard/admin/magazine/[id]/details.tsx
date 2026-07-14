import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { updateIssueDetails } from "@/domain/magazine/mutations";
import { setFlash } from "@/utils";

const LIST = "/dashboard/admin/magazine";

export const POST = createRoute(async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    await setFlash(c, "danger", "Missing issue id");
    return c.redirect(LIST, 303);
  }
  const body = await c.req.parseBody();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    await setFlash(c, "danger", "Title is required.");
    return c.redirect(`${LIST}/${id}`, 303);
  }
  const subtitle =
    typeof body.subtitle === "string" ? body.subtitle.trim() : "";
  const letterTitle =
    typeof body.editorsLetterTitle === "string"
      ? body.editorsLetterTitle.trim()
      : "";
  const letterBody =
    typeof body.editorsLetter === "string" ? body.editorsLetter : "";
  const paragraphs = letterBody
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [error] = await updateIssueDetails(id, {
    title,
    subtitle: subtitle || null,
    editorsLetterTitle: letterTitle || null,
    editorsLetter: paragraphs,
  });
  await setFlash(
    c,
    error ? "danger" : "success",
    error ? error.reason : "Details saved.",
  );
  return c.redirect(`${LIST}/${id}`, 303);
});
