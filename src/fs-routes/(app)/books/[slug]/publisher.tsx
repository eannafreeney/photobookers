import { paramValidator } from "../../../../lib/validator";
import { createRoute } from "hono-fsr";
import { slugSchema } from "../../../../features/app/schema";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import {
  getBookPublisherBySlug,
  getBooksByCreatorSlug,
} from "../../../../features/app/services";
import InfoPage from "../../../../pages/InfoPage";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import MobileCreatorCard from "../../../../components/app/MobileCreatorCard";
import CreatorCard from "../../../../components/app/CreatorCard";
import BookNavTabs from "../../../../features/app/components/BookNavTabs";
import Divider from "../../../../components/Divider";
import BooksGrid from "../../../../features/app/components/BooksGrid";
import BookGridWrapper from "../../../../features/app/components/BookGridWrapper";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = c.req.param("slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);

    const [error, book] = await getBookPublisherBySlug(slug);

    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    const [publisherBooksError, publisherData] = await getBooksByCreatorSlug(
      book?.publisher?.slug ?? "",
      currentPage,
    );

    return c.html(
      <AppLayout
        title={book?.title ?? ""}
        user={user}
        currentPath={currentPath}
        adminEditHref={`/dashboard/admin/books/${book.id}`}
      >
        <Page>
          <div class="flex flex-col gap-4">
            <MobileCreatorCard creator={book.artist} user={user} />
            <BookNavTabs
              bookSlug={book.slug}
              currentPath={currentPath}
              hasPublisher={!!book.publisher}
            />
            <CreatorCard
              creator={book.publisher}
              currentPath={currentPath}
              user={user}
            />
            <Divider />
            <BookGridWrapper
              bookSlug={book.slug}
              currentPage={currentPage}
              creator={book?.publisher ?? null}
              currentPath={currentPath}
              user={user}
            />
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
