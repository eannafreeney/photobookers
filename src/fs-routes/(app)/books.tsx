import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import { BOOKS_CATALOG_TARGET_ID } from "../../features/app/components/BookFilters";
import AppLayout from "../../components/layouts/AppLayout";
import { getFilteredBooks } from "../../features/app/services";
import PageHeader from "../../components/app/PageHeader";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import { booksFilterUrl } from "../../lib/tags";
import BooksGridWithFilters from "../../features/app/components/BookGridWithFilters";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const tag = c.req.query("tag") ?? null;
  const q = c.req.query("q") ?? null;
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = booksFilterUrl("/books", { tag, q });
  const isFiltered = Boolean(tag?.trim() || (q?.trim()?.length ?? 0) >= 3);

  const [error, result] = await getFilteredBooks({
    tag,
    q,
    page: currentPage,
    limit: 30,
  });

  if (error || !result) return c.html(<></>);

  if (c.req.query("fragment") === "grid") {
    return c.html(
      <div id={BOOKS_CATALOG_TARGET_ID} x-merge="replace">
        <BooksGridWithFilters
          user={user}
          tag={tag}
          q={q}
          currentPath={currentPath}
          result={result}
          isFiltered={isFiltered}
        />
      </div>,
    );
  }

  const title = pageTitle("All Books");
  const description =
    "Browse the full photobookers catalogue. Discover photobooks from artists and publishers around the world.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, currentPath)}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="The Catalogue"
          title="All Books"
          intro="Every photobook in the archive, newest first. Artists and publishers from around the world."
        />
        <div id={BOOKS_CATALOG_TARGET_ID}>
          <BooksGridWithFilters
            user={user}
            tag={tag}
            q={q}
            currentPath={currentPath}
            result={result}
            isFiltered={isFiltered}
          />
        </div>
      </Page>
    </AppLayout>,
  );
});
