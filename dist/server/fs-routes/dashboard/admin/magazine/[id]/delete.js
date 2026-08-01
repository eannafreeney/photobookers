import { createRoute } from "hono-fsr";
import { deleteIssue } from "../../../../../domain/magazine/mutations.js";
import { setFlash } from "../../../../../utils.js";
const LIST = "/dashboard/admin/magazine";
const DELETE = createRoute(async (c) => {
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
export {
  DELETE
};
