import { createRoute } from "hono-fsr";
import BooksGrid from "../../../features/app/components/BooksGrid";
import Button from "../../../components/app/Button";
import { getLatestBooks } from "../../../features/app/services";
import { getUser } from "../../../utils";
import { Context } from "hono";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);

  const [error, result] = await getLatestBooks(page, 10);

  if (error) return c.html(<></>);

  return c.html(
    <div id="latest-books-fragment">
      <BooksGrid
        title="Latest Books"
        user={user}
        currentPath={currentPath}
        result={result}
        isPaginated={false}
      />
      <div class="flex justify-center mt-8">
        <a href="/books">
          <Button variant="solid" color="primary" width="xl">
            View All Books →
          </Button>
        </a>
      </div>
    </div>,
  );
});
