import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { Context } from "hono";
import { getUser } from "../../../utils";
import {
  getPublicBooksInWishlist,
  getPublicShelfBySlug,
} from "../../../domain/shelf/services";
import InfoPage from "../../../pages/InfoPage";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import BooksGrid from "../../../features/app/components/BooksGrid";
import PageHeader from "../../../components/app/PageHeader";
import ShareButton from "../../../features/api/components/ShareButton";
import { canonicalUrl, pageTitle, shelfDescription } from "../../../lib/seo";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { routeParam } from "../../../lib/routeParam";
import {
  shelfProfileUrl,
  shelfShareText,
  shelfShareTitle,
} from "../../../lib/share";
import { getInitialsAvatar } from "../../../lib/avatar";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = routeParam(c, "slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);

    if (!isFeatureEnabledForUser("publicShelf", user)) {
      return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
    }

    const [ownerError, ownerResult] = await getPublicShelfBySlug(slug);
    if (ownerError || !ownerResult) {
      return c.html(
        <InfoPage errorMessage={ownerError?.reason ?? "Shelf not found"} user={user} />,
        404,
      );
    }

    const { user: owner } = ownerResult;
    const [booksError, booksResult] = await getPublicBooksInWishlist(
      owner.id,
      currentPage,
    );

    if (booksError || !booksResult) {
      return c.html(
        <InfoPage
          errorMessage={booksError?.reason ?? "Failed to load shelf"}
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

    const title = pageTitle(`${owner.displayName}'s shelf`);
    const description = shelfDescription(
      owner.displayName,
      booksResult.totalCount ?? booksResult.books.length,
    );
    const shelfCanonicalUrl = canonicalUrl(c.req.url, shelfProfileUrl(slug));
    const avatarUrl =
      owner.profileImageUrl ??
      getInitialsAvatar(owner.firstName ?? "", owner.lastName ?? "");
    const isOwner = user?.id === owner.id;

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={shelfCanonicalUrl}
        user={user}
        currentPath={currentPath}
        shareOg={{
          title: shelfShareTitle(owner.displayName),
          description,
          url: shelfCanonicalUrl,
          image: owner.profileImageUrl ?? undefined,
        }}
      >
        <Page>
          <div class="flex flex-col gap-4">
            {isOwner ? (
              <p class="rounded border border-outline bg-surface-alt px-4 py-3 text-sm text-on-surface">
                This is your public shelf.{" "}
                <a href="/shelf" class="text-accent underline underline-offset-2">
                  Manage sharing settings
                </a>
              </p>
            ) : null}
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-4">
                <img
                  src={avatarUrl}
                  alt=""
                  class="size-16 rounded-full object-cover shrink-0"
                  loading="lazy"
                />
                <PageHeader
                  kicker="Shelf"
                  title={`${owner.displayName}'s shelf`}
                  intro={description}
                />
              </div>
              <ShareButton
                title={shelfShareTitle(owner.displayName)}
                text={shelfShareText(owner.displayName)}
                url={shelfProfileUrl(slug)}
              />
            </div>
            <BooksGrid
              user={user}
              currentPath={currentPath}
              result={booksResult}
              noResultsMessage="No public favorites yet."
            />
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
