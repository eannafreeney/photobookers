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
import ListBookCard from "../../../../../features/app/components/ListBookCard";
import ListNavigation from "../../../../../features/app/components/ListNavigation";
import ShareButton from "../../../../../features/api/components/ShareButton";
import { canonicalUrl, pageTitle } from "../../../../../lib/seo";
import { routeParam } from "../../../../../lib/routeParam";
import { z } from "zod";
import { formatShelfOwnerName } from "../../../../../domain/shelf/utils";
import { listSlugSchema } from "../../../../../domain/lists/utils";
import { slugSchema } from "../../../../../features/app/schema";
import { getInitialsAvatar } from "../../../../../lib/avatar";

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
    const shareImage =
      owner.profileImageUrl ?? booksResult.books[0]?.coverUrl ?? undefined;
    const avatarUrl =
      owner.profileImageUrl ??
      getInitialsAvatar(owner.firstName ?? "", owner.lastName ?? "");

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
          <div class="mx-auto flex w-full max-w-xl flex-col items-center gap-12">
            <div class="flex w-full flex-col items-center gap-3 border-b-2 border-on-surface-strong pb-6 text-center">
              <h1 class="text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-5xl">
                {list.title}
              </h1>
              <a
                href={`/shelf/${shelfSlug}`}
                class="flex items-center gap-2 text-on-surface-strong hover:opacity-75"
              >
                <img
                  src={avatarUrl}
                  alt={displayName}
                  class="size-8 rounded-full object-cover"
                  loading="lazy"
                />
                <span class="text-sm font-medium">{displayName}</span>
              </a>
              {list.description ? (
                <p class="max-w-prose text-on-surface text-pretty">
                  {list.description}
                </p>
              ) : null}
              <div class="w-full max-w-xs pt-2">
                <ShareButton
                  title={`${list.title} · ${displayName}`}
                  text={`Check out ${list.title} by ${displayName} on Photobookers`}
                  url={listPath}
                />
              </div>
            </div>

            <div id="list-books" class="flex w-full flex-col gap-16">
              <div id="list-book-cards" x-merge="replace" class="flex flex-col gap-12">
                {booksResult.books.length > 0 ? (
                  booksResult.books.map((book, index) => (
                    <>
                      {index > 0 ? (
                        <div
                          class="flex items-center justify-center gap-2 text-on-surface-weak"
                          aria-hidden="true"
                        >
                          <span>•</span>
                          <span>•</span>
                          <span>•</span>
                        </div>
                      ) : null}
                      <ListBookCard book={book} user={user} />
                    </>
                  ))
                ) : (
                  <p class="py-8 text-center text-sm text-on-surface">
                    No books in this list yet.
                  </p>
                )}
              </div>
              <ListNavigation
                currentPath={currentPath}
                page={booksResult.page}
                totalPages={booksResult.totalPages}
                targetId="list-book-cards"
              />
            </div>
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
