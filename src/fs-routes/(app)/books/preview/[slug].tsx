import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import { getIsMobile } from "../../../../lib/device";
import { paramValidator } from "../../../../lib/validator";
import { slugSchema } from "../../../../features/app/schema";
import { requireBookPreviewAccess } from "../../../../middleware/bookGuard";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import { getBookBySlug } from "../../../../features/app/services";
import BookDetail from "../../../../features/app/components/BookDetail";
import InfoPage from "../../../../pages/InfoPage";
import { BookDetailContext } from "../../../../features/app/types";

export const GET = createRoute(
  paramValidator(slugSchema),
  requireBookPreviewAccess,
  async (c: BookDetailContext) => {
    const bookSlug = c.req.valid("param").slug;
    const user = await getUser(c);
    const currentPath = c.req.path;
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

    const [error, result] = await getBookBySlug(bookSlug, "draft");

    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);
    }

    const { book } = result;

    const galleryImages = [
      book.coverUrl,
      ...(book?.images?.map((image) => image.imageUrl) ?? []),
    ];

    return c.html(
      <AppLayout
        title={book.title}
        user={user}
        isPreview
        currentPath={currentPath}
        adminEditHref={`/dashboard/admin/books/${book.id}/update`}
      >
        <Page>
          <BookDetail
            galleryImages={galleryImages}
            book={book}
            currentPath={currentPath}
            user={user}
            isMobile={isMobile}
          />
        </Page>
      </AppLayout>,
    );
  },
);
