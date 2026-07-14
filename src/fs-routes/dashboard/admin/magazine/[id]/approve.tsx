import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { setIssueStatus } from "@/domain/magazine/mutations";
import { setFlash } from "@/utils";

const LIST = "/dashboard/admin/magazine";

export const POST = createRoute(async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    await setFlash(c, "danger", "Missing issue id");
    return c.redirect(LIST, 303);
  }
  const [error] = await setIssueStatus(id, "approved");
  await setFlash(
    c,
    error ? "danger" : "success",
    error ? error.reason : "Issue approved.",
  );
  return c.redirect(`${LIST}/${id}`, 303);
});
