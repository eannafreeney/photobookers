import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { updateIssueBookBlurb } from "@/domain/magazine/mutations";
import { setFlash } from "@/utils";

const LIST = "/dashboard/admin/magazine";

export const POST = createRoute(async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    await setFlash(c, "danger", "Missing issue id");
    return c.redirect(LIST, 303);
  }
  const body = await c.req.parseBody();
  const bookId = typeof body.bookId === "string" ? body.bookId : "";
  const blurbRaw = typeof body.blurb === "string" ? body.blurb.trim() : "";
  const [error] = await updateIssueBookBlurb(id, bookId, blurbRaw || null);
  await setFlash(
    c,
    error ? "danger" : "success",
    error ? error.reason : "Description saved.",
  );
  return c.redirect(`${LIST}/${id}`, 303);
});
