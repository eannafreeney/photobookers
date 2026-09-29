import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import PageHeader from "../../../components/app/PageHeader";
import InfoPage from "../../../pages/InfoPage";
import Link from "../../../components/app/Link";
import { listBooksAvailableForReview } from "../../../domain/reviews/services";
import { canonicalUrl, pageTitle } from "../../../lib/seo";
import { getUser } from "../../../utils";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const [error, books] = await listBooksAvailableForReview();
  if (error) return c.html(<InfoPage errorMessage={error.reason} user={user} />);

  return c.html(
    <AppLayout
      title={pageTitle("Review copies")}
      description="Photobooks whose creators are offering a review copy."
      canonicalUrl={canonicalUrl(c.req.url, "/reviews/copies")}
      currentPath={c.req.path}
      user={user}
    >
      <Page>
        <div class="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <PageHeader
            kicker="Review copies"
            title="Available for review"
            intro="Reviewers with a profile can request a copy. The creator sends the book themselves."
          />
          {books.length === 0 ? (
            <p class="text-on-surface">No books are offering review copies yet.</p>
          ) : (
            <ul class="flex flex-col gap-4 border-t border-outline pt-8">
              {books.map((book) => (
                <li class="flex items-center justify-between gap-4 border-b border-outline pb-4">
                  <div>
                    <Link
                      href={`/books/${book.slug}`}
                      className="font-display text-xl text-on-surface-strong no-underline hover:text-accent"
                    >
                      {book.title}
                    </Link>
                    {book.artistName ? (
                      <p class="text-sm text-on-surface">{book.artistName}</p>
                    ) : null}
                  </div>
                  <Link
                    href={`/books/${book.slug}/review-request`}
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-accent"
                  >
                    Request
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Page>
    </AppLayout>,
  );
});
