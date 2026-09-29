import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../../../utils";
import { deleteReview } from "../../../../../domain/reviews/services";

export const POST = createRoute(async (c) => {
  const slug = c.req.param("slug") ?? "";
  const user = await getUser(c);
  if (!user?.id) return c.redirect("/auth/login");
  const [error] = await deleteReview(user.id, slug);
  if (error) {
    await setFlash(c, "danger", error.reason);
    return c.redirect(`/books/${slug}/review`);
  }
  await setFlash(c, "success", "Review deleted");
  return c.redirect(`/books/${slug}`);
});
