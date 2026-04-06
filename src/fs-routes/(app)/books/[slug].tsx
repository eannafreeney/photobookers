import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { getIsMobile } from "../../../lib/device";
import { getUser } from "../../../utils";
import { getBookBySlug } from "../../../features/app/services";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import BookDetail from "../../../features/app/components/BookDetail";
import { BookDetailContext } from "../../../features/app/types";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: BookDetailContext) => {
    const bookSlug = c.req.valid("param").slug;
    const user = await getUser(c);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
    const currentPath = c.req.path;

    const [error, result] = await getBookBySlug(bookSlug, "published");

    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    const { book } = result;

    const galleryImages = [
      book.coverUrl,
      ...(book?.images?.map((image) => image.imageUrl) ?? []),
    ];

    return c.html(
      <AppLayout
        title={book.title}
        user={user}
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
