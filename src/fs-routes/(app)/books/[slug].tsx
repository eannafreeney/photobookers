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
import {
  bookDescription,
  bookPageTitle,
  buildBookJsonLd,
  canonicalUrl,
} from "../../../lib/seo";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: BookDetailContext) => {
    const bookSlug = c.req.valid("param").slug;
    const user = await getUser(c);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);

    const [error, result] = await getBookBySlug(bookSlug, "published");

    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    const { book } = result;
    const bookCanonicalUrl = canonicalUrl(c.req.url, `/books/${book.slug}`);
    const description = bookDescription(book);
    const title = bookPageTitle(book.title, book.artist?.displayName);

    const galleryImages = [
      book.coverUrl,
      ...(book?.images?.map((image: { imageUrl: string }) => image.imageUrl) ??
        []),
    ].filter((url): url is string => url !== null);

    if (!user) {
      c.header("Vary", "Cookie");
      c.header(
        "Cache-Control",
        "private, max-age=120, stale-while-revalidate=600",
      );
    } else {
      c.header("Cache-Control", "private, no-store");
    }

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={bookCanonicalUrl}
        user={user}
        currentPath={currentPath}
        adminEditHref={`/dashboard/admin/books/${book.id}`}
        shareOg={{
          title,
          description,
          image: book.coverUrl ?? undefined,
          url: bookCanonicalUrl,
        }}
        jsonLd={buildBookJsonLd(book, bookCanonicalUrl)}
      >
        <Page>
          <BookDetail
            galleryImages={galleryImages}
            book={book}
            currentPath={currentPath}
            user={user}
            isMobile={isMobile}
            currentPage={currentPage}
          />
        </Page>
      </AppLayout>,
    );
  },
);
