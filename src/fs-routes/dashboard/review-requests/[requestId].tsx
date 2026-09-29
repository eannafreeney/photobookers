import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../utils";
import { reviewRequestStatusSchema } from "../../../domain/reviews/schema";
import { updateReviewRequestStatus } from "../../../domain/reviews/services";

export const POST = createRoute(async (c) => {
  const user = await getUser(c);
  const requestId = c.req.param("requestId") ?? "";
  const parsed = reviewRequestStatusSchema.safeParse(await c.req.parseBody());
  if (!parsed.success) {
    await setFlash(c, "danger", "Choose a status");
    return c.redirect("/dashboard/review-requests");
  }
  const [error] = await updateReviewRequestStatus(
    user.id,
    user.isAdmin,
    requestId,
    parsed.data.status,
  );
  await setFlash(
    c,
    error ? "danger" : "success",
    error?.reason ?? "Request updated",
  );
  return c.redirect("/dashboard/review-requests");
});
