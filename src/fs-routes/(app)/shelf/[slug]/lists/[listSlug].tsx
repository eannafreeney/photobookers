import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { Context } from "hono";
import { getUser } from "../../../../../utils";
import {
  getBooksInList,
  getPublicListByShelfAndSlug,
} from "../../../../../domain/lists/services";
import InfoPage from "../../../../../pages/InfoPage";
import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import BooksGrid from "../../../../../features/app/components/BooksGrid";
import ShareButton from "../../../../../features/api/components/ShareButton";
import { canonicalUrl, pageTitle } from "../../../../../lib/seo";
import { isFeatureEnabledForUser } from "../../../../../lib/features";
import { routeParam } from "../../../../../lib/routeParam";
import { z } from "zod";
import { formatShelfOwnerName } from "../../../../../domain/shelf/utils";
import { listSlugSchema } from "../../../../../domain/lists/utils";
import { slugSchema } from "../../../../../features/app/schema";

const listParamsSchema = z.object({
  slug: slugSchema.shape.slug,
  listSlug: listSlugSchema,
});

export const GET = createRoute(
  paramValidator(listParamsSchema),
  async (c: Context) => {
    const shelfSlug = routeParam(c, "slug");
    const listSlug = routeParam(c, "listSlug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);

    if (!isFeatureEnabledForUser("collectors", user)) {
      return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
    }

    const [ownerError, result] = await getPublicListByShelfAndSlug(
      shelfSlug,
      listSlug,
    );
    if (ownerError || !result) {
      return c.html(
        <InfoPage
          errorMessage={ownerError?.reason ?? "List not found"}
          user={user}
        />,
        404,
      );
    }

    const { owner, list } = result;
    const displayName = formatShelfOwnerName({
      firstName: owner.firstName,
      lastName: owner.lastName,
    });

    const [booksError, booksResult] = await getBooksInList(
      list.id,
      currentPage,
    );
    if (booksError || !booksResult) {
      return c.html(
        <InfoPage
          errorMessage={booksError?.reason ?? "Failed to load list"}
          user={user}
        />,
      );
    }

    if (!user) {
      c.header("Vary", "Cookie");
      c.header(
        "Cache-Control",
        "private, max-age=120, stale-while-revalidate=600",
      );
    } else {
      c.header("Cache-Control", "private, no-store");
    }

    const title = pageTitle(`${list.title} · ${displayName}`);
    const description =
      list.description?.trim() ||
      `${list.title} — a book list by ${displayName} on Photobookers.`;
    const listPath = `/shelf/${shelfSlug}/lists/${list.slug}`;
    const listCanonicalUrl = canonicalUrl(c.req.url, listPath);
    const shareImage = booksResult.books[0]?.coverUrl ?? undefined;

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={listCanonicalUrl}
        user={user}
        currentPath={currentPath}
        shareOg={{
          title: `${list.title} · ${displayName}`,
          description,
          url: listCanonicalUrl,
          image: shareImage,
        }}
      >
        <Page>
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2 border-b-2 border-on-surface-strong pb-4">
              <a
                href={`/shelf/${shelfSlug}`}
                class="text-sm text-accent underline underline-offset-2"
              >
                ← {displayName}'s shelf
              </a>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h1 class="text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-5xl">
                    {list.title}
                  </h1>
                  {list.description ? (
                    <p class="mt-2 max-w-2xl text-on-surface text-pretty">
                      {list.description}
                    </p>
                  ) : null}
                </div>
                <ShareButton
                  title={`${list.title} · ${displayName}`}
                  text={`Check out ${list.title} by ${displayName} on Photobookers`}
                  url={listPath}
                />
              </div>
            </div>

            <BooksGrid
              user={user}
              currentPath={currentPath}
              result={booksResult}
              noResultsMessage="No books in this list yet."
            />
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
