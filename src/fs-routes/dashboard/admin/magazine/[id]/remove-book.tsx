import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { removeIssueBook } from "@/domain/magazine/mutations";
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
  const [error] = await removeIssueBook(id, bookId);
  await setFlash(
    c,
    error ? "danger" : "success",
    error ? error.reason : "Book removed.",
  );
  return c.redirect(`${LIST}/${id}`, 303);
});
