import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import BooksGrid from "../../features/app/components/BooksGrid";
import AppLayout from "../../components/layouts/AppLayout";
import { getLatestBooks } from "../../features/app/services";
import SectionTitle from "../../components/app/SectionTitle";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  const [error, result] = await getLatestBooks(currentPage, 30);

  if (error) return c.html(<></>);

  return c.html(
    <AppLayout title="Books" user={user} currentPath={currentPath}>
      <Page>
        <SectionTitle>All Books</SectionTitle>
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
