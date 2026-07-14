import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { deleteIssue } from "@/domain/magazine/mutations";
import { setFlash } from "@/utils";

const LIST = "/dashboard/admin/magazine";

export const DELETE = createRoute(async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    await setFlash(c, "danger", "Missing issue id");
    return c.redirect(LIST, 303);
  }
  const [error] = await deleteIssue(id);
  if (error) {
    await setFlash(c, "danger", error.reason);
    return c.redirect(`${LIST}/${id}`, 303);
  }
  await setFlash(c, "success", "Issue deleted.");
  return c.redirect(LIST, 303);
});
