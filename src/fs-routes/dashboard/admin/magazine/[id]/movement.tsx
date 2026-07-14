import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { updateIssueMovement } from "@/domain/magazine/mutations";
import { setFlash } from "@/utils";

const LIST = "/dashboard/admin/magazine";

export const POST = createRoute(async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    await setFlash(c, "danger", "Missing issue id");
    return c.redirect(LIST, 303);
  }
  const body = await c.req.parseBody();
  const movementId =
    typeof body.movementId === "string" ? body.movementId : "";
  if (!movementId) {
    await setFlash(c, "danger", "Missing movement.");
    return c.redirect(`${LIST}/${id}`, 303);
  }
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const [error] = await updateIssueMovement(id, movementId, {
    kicker: str(body.kicker),
    lead: str(body.lead),
    title: str(body.title),
  });
  await setFlash(
    c,
    error ? "danger" : "success",
    error ? error.reason : "Movement saved.",
  );
  return c.redirect(`${LIST}/${id}`, 303);
});
