import { paramValidator } from "../../../../lib/validator";
import { createRoute } from "hono-fsr";
import { slugSchema } from "../../../../features/app/schema";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import { getBookAboutBySlug } from "../../../../features/app/services";
import InfoPage from "../../../../pages/InfoPage";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import MobileCreatorCard from "../../../../components/app/MobileCreatorCard";
import CreatorCard from "../../../../components/app/CreatorCard";
import BookNavTabs from "../../../../features/app/components/BookNavTabs";
import RelatedBooks from "../../../../features/app/components/RelatedBooks";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = c.req.param("slug");
    const user = await getUser(c);
    const currentPath = c.req.path;

    const [error, book] = await getBookAboutBySlug(slug);

    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);
    }

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
            <RelatedBooks book={book} user={user} />
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
