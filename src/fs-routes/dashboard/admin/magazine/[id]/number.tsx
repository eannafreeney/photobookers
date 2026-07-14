import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { setIssueNumber } from "@/domain/magazine/mutations";
import { setFlash } from "@/utils";

const LIST = "/dashboard/admin/magazine";

export const POST = createRoute(async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    await setFlash(c, "danger", "Missing issue id");
    return c.redirect(LIST, 303);
  }
  const body = await c.req.parseBody();
  const parsed = Number(body.issueNumber);
  if (!Number.isInteger(parsed) || parsed < 1) {
    await setFlash(c, "danger", "Enter a valid issue number.");
    return c.redirect(`${LIST}/${id}`, 303);
  }
  const [error] = await setIssueNumber(id, parsed);
  await setFlash(
    c,
    error ? "danger" : "success",
    error ? error.reason : `Issue number set to ${parsed}.`,
  );
  return c.redirect(`${LIST}/${id}`, 303);
});
