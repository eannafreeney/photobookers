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
    const currentPage = Number(c.req.query("page") ?? 1);

    const [error, result] = await getBookBySlug(bookSlug, "published");

    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    const { book } = result;
    const canonicalUrl = new URL(`/books/${book.slug}`, c.req.url).href;

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
        title={book.title}
        user={user}
        currentPath={currentPath}
        adminEditHref={`/dashboard/admin/books/${book.id}`}
        shareOg={
          book.coverUrl
            ? {
                title: book.title,
                description: book.description?.slice(0, 200) ?? undefined,
                image: book.coverUrl,
                url: canonicalUrl,
              }
            : undefined
        }
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
