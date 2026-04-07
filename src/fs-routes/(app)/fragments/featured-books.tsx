import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import { getThisWeeksFeaturedBooks } from "../../../features/app/FeaturedServices";
import FeaturedBooksGrid from "../../../features/app/components/FeaturedBooksGrid";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);

  const [error, result] = await getThisWeeksFeaturedBooks();
  if (error) return c.html(<></>);
  const { featuredBooks } = result;

  if (!featuredBooks || featuredBooks.length === 0) return c.html(<></>);

  return c.html(
    <div id="featured-books-fragment">
      <FeaturedBooksGrid featuredBooks={featuredBooks} user={user} />
    </div>,
  );
});
