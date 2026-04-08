import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { tagSchema } from "../../../../features/app/schema";
import { capitalize, getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import BooksGrid from "../../../../features/app/components/BooksGrid";
import Intersector from "../../../../features/app/components/Intersector";
import { getBooksByTag } from "../../../../features/app/services";
import InfoPage from "../../../../pages/InfoPage";
import { BookTagContext } from "../../../../features/app/types";

export const GET = createRoute(
  paramValidator(tagSchema),
  async (c: BookTagContext) => {
    const tag = c.req.valid("param").tag;
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);

    const [error, result] = await getBooksByTag(tag, currentPage);
    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    return c.html(
      <AppLayout
        title={`# ${capitalize(tag)}`}
        user={user}
        currentPath={currentPath}
      >
        <Page>
          <BooksGrid
            title={`# ${capitalize(tag)}`}
            user={user}
            currentPath={currentPath}
            result={result}
          />
          {result.books.length > 0 && (
            <Intersector
              id="related-books-fragment"
              endpoint={`/fragments/related-books/${result.books[0].slug}`}
            />
          )}
        </Page>
      </AppLayout>,
    );
  },
);
