import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import BooksGrid from "../../features/app/components/BooksGrid";
import AppLayout from "../../components/layouts/AppLayout";
import { getLatestBooks } from "../../features/app/services";
import PageHeader from "../../components/app/PageHeader";
import { canonicalUrl, pageTitle } from "../../lib/seo";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  const [error, result] = await getLatestBooks(currentPage, 30);

  if (error) return c.html(<></>);

  const title = pageTitle("All Books");
  const description =
    "Browse the full photobookers catalogue. Discover photobooks from artists and publishers around the world.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/books")}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="The Catalogue"
          title="All Books"
          intro="Every photobook in the archive, newest first. Artists and publishers from around the world."
        />
        <BooksGrid
          isInfiniteScroll
          user={user}
          currentPath={currentPath}
          result={result}
        />
      </Page>
    </AppLayout>,
  );
});
