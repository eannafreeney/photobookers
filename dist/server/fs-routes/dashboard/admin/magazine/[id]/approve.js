import { createRoute } from "hono-fsr";
import { setIssueStatus } from "../../../../../domain/magazine/mutations.js";
import { setFlash } from "../../../../../utils.js";
const LIST = "/dashboard/admin/magazine";
const POST = createRoute(async (c) => {
  const id = c.req.param("id");
  if (!id) {
    await setFlash(c, "danger", "Missing issue id");
    return c.redirect(LIST, 303);
  }
  const [error] = await setIssueStatus(id, "approved");
  await setFlash(
    c,
    error ? "danger" : "success",
    error ? error.reason : "Issue approved."
  );
  return c.redirect(`${LIST}/${id}`, 303);
});
export {
  POST
};
