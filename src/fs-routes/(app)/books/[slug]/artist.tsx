import { paramValidator } from "../../../../lib/validator";
import { createRoute } from "hono-fsr";
import { slugSchema } from "../../../../features/app/schema";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import {
  getBookAboutBySlug,
  getBooksByCreatorSlug,
} from "../../../../features/app/services";
import InfoPage from "../../../../pages/InfoPage";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import MobileCreatorCard from "../../../../components/app/MobileCreatorCard";
import CreatorCard from "../../../../components/app/CreatorCard";
import BookNavTabs from "../../../../features/app/components/BookNavTabs";
import RelatedBooks from "../../../../features/app/components/RelatedBooks";
import BooksGrid from "../../../../features/app/components/BooksGrid";
import { books } from "../../../../db/schema";
import Divider from "../../../../components/Divider";
import { getBooksByCreatorId } from "../../../../features/dashboard/admin/creators/services";
import BookGridWrapper from "../../../../features/app/components/BookGridWrapper";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = c.req.param("slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);

    const [bookError, book] = await getBookAboutBySlug(slug);

    if (bookError)
      return c.html(<InfoPage errorMessage={bookError.reason} user={user} />);

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
            <div class="flex flex-col sm:items-center gap-2">
              <CreatorCard
                creator={book.artist}
                currentPath={currentPath}
                user={user}
              />
            </div>
            <Divider />
            <BookGridWrapper
              bookSlug={book.slug}
              currentPage={currentPage}
              creator={book?.artist ?? null}
              currentPath={currentPath}
              user={user}
            />
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
