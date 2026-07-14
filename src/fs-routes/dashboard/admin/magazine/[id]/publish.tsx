import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { togglePublish } from "@/domain/magazine/mutations";
import { setFlash } from "@/utils";

const LIST = "/dashboard/admin/magazine";

export const POST = createRoute(async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    await setFlash(c, "danger", "Missing issue id");
    return c.redirect(LIST, 303);
  }
  const body = await c.req.parseBody();
  const redirectTo =
    typeof body.redirect === "string" && body.redirect.startsWith(LIST)
      ? body.redirect
      : `${LIST}/${id}`;
  const [error, nowPublished] = await togglePublish(id);
  await setFlash(
    c,
    error ? "danger" : "success",
    error
      ? error.reason
      : nowPublished
        ? "Published."
        : "Unpublished — hidden from the site.",
  );
  return c.redirect(redirectTo, 303);
});
