import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { Context } from "hono";
import { getUser } from "../../../utils";
import {
  getPublicBooksInWishlist,
  getPublicShelfBySlug,
} from "../../../domain/shelf/services";
import { getPublicListsForUser } from "../../../domain/lists/services";
import InfoPage from "../../../pages/InfoPage";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import BooksGrid from "../../../features/app/components/BooksGrid";
import ShareButton from "../../../features/api/components/ShareButton";
import { canonicalUrl, pageTitle, shelfDescription } from "../../../lib/seo";
import { routeParam } from "../../../lib/routeParam";
import {
  shelfProfileUrl,
  shelfShareText,
  shelfShareTitle,
} from "../../../lib/share";
import { getInitialsAvatar } from "../../../lib/avatar";
import { listPosts } from "../../../db/queries";
import { getPostLikeStats } from "../../../domain/posts/likes";
import { getPublishedContributionsByUserId } from "../../../domain/contributors/services";
import PostCard from "../../../features/collectors/components/PostCard";
import CollectorFollowButton from "../../../features/api/components/CollectorFollowButton";
import ShelfListsSection from "../../../features/app/components/ShelfListsSection";
import VerificationBadge from "../../../components/app/VerificationBadge";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = routeParam(c, "slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);

    const [ownerError, ownerResult] = await getPublicShelfBySlug(slug);
    if (ownerError || !ownerResult) {
      return c.html(
        <InfoPage
          errorMessage={ownerError?.reason ?? "Shelf not found"}
          user={user}
        />,
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

    const posts = owner.creator ? [] : await listPosts(owner.id);
    const postLikeStats = await getPostLikeStats(
      posts.map((post) => post.id),
      user?.id,
    );
    const publicLists = await getPublicListsForUser(owner.id);
    const contributions = await getPublishedContributionsByUserId(owner.id);

    const title = pageTitle(`${owner.displayName}'s shelf`);
    const description = shelfDescription(
      owner.displayName,
      booksResult.totalCount ?? booksResult.books.length,
    );
    const shelfCanonicalUrl = canonicalUrl(c.req.url, shelfProfileUrl(slug));
    const avatarUrl =
      owner.profileImageUrl ??
      getInitialsAvatar(owner.firstName ?? "", owner.lastName ?? "");
    // Share preview image: prefer the owner's photo, otherwise the first book
    // cover so the shelf still shows something when shared.
    const shareImage =
      owner.profileImageUrl ?? booksResult.books[0]?.coverUrl ?? undefined;
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
          image: shareImage,
        }}
      >
        <Page>
          <div
            class="flex flex-col gap-4"
            x-data="{ tab: new URLSearchParams(window.location.search).get('tab') || 'favourites' }"
          >
            {isOwner ? (
              <p class="rounded border border-outline bg-surface-alt px-4 py-3 text-sm text-on-surface">
                This is your public shelf.{" "}
                <a
                  href="/dashboard/shelf"
                  class="text-accent underline underline-offset-2"
                >
                  Manage sharing settings
                </a>
              </p>
            ) : null}
            <div class="flex flex-col gap-4 border-b-2 border-on-surface-strong pb-4 md:flex-row md:items-end md:justify-between">
              <div class="flex items-center gap-4">
                <div class="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt={owner.displayName}
                    class="size-14 rounded-full object-cover"
                    loading="lazy"
                  />
                  {!owner.creator ? (
                    <div class="absolute -top-1 -right-1">
                      <VerificationBadge
                        creatorStatus="verified"
                        size="sm"
                        title="Verified Collector"
                      />
                    </div>
                  ) : null}
                </div>
                <div class="flex flex-col gap-1">
                  <h1 class="text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-6xl">
                    {`${owner.displayName}'s shelf`}
                  </h1>
                  {owner.creator?.slug ? (
                    <a
                      href={`/creators/${owner.creator.slug}`}
                      class="text-sm text-accent underline underline-offset-2"
                    >
                      Also a creator → {owner.creator.displayName}
                    </a>
                  ) : null}
                </div>
              </div>
              <div
                class={`grid w-full gap-2 md:w-auto md:min-w-72 md:gap-4 ${isOwner ? "grid-cols-1" : "grid-cols-2"}`}
              >
                {!isOwner ? (
                  <CollectorFollowButton
                    targetUserId={owner.id}
                    user={user}
                  />
                ) : null}
                <ShareButton
                  title={shelfShareTitle(owner.displayName)}
                  text={shelfShareText(owner.displayName)}
                  url={shelfProfileUrl(slug)}
                />
              </div>
            </div>

            <div class="flex gap-2" role="tablist">
              <button
                type="button"
                x-on:click="tab = 'favourites'"
                x-bind:class="tab === 'favourites' ? 'border-b-2 border-accent text-on-surface-strong' : 'text-on-surface-weak'"
                class="px-3 py-2 text-sm font-medium cursor-pointer"
              >
                Favourites
              </button>
              <button
                type="button"
                x-on:click="tab = 'lists'"
                x-bind:class="tab === 'lists' ? 'border-b-2 border-accent text-on-surface-strong' : 'text-on-surface-weak'"
                class="px-3 py-2 text-sm font-medium cursor-pointer"
              >
                {`Lists (${publicLists.length + 1})`}
              </button>
              {owner.creator ? (
                <a
                  href={`/creators/${owner.creator.slug}`}
                  class="px-3 py-2 text-sm font-medium text-accent underline underline-offset-2"
                >
                  Posts on creator profile →
                </a>
              ) : (
                <button
                  type="button"
                  x-on:click="tab = 'posts'"
                  x-bind:class="tab === 'posts' ? 'border-b-2 border-accent text-on-surface-strong' : 'text-on-surface-weak'"
                  class="px-3 py-2 text-sm font-medium cursor-pointer"
                >
                  {`Posts (${posts.length})`}
                </button>
              )}
              <button
                type="button"
                x-on:click="tab = 'contributions'"
                x-bind:class="tab === 'contributions' ? 'border-b-2 border-accent text-on-surface-strong' : 'text-on-surface-weak'"
                class="px-3 py-2 text-sm font-medium cursor-pointer"
              >
                {`Contributions (${contributions.length})`}
              </button>
            </div>

            <div x-show="tab === 'favourites'" id="favourites">
              <BooksGrid
                user={user}
                currentPath={currentPath}
                result={booksResult}
                noResultsMessage="No public favorites yet."
              />
            </div>

            <div x-show="tab === 'lists'" x-cloak>
              <ShelfListsSection
                shelfSlug={slug}
                favoritesCount={
                  booksResult.totalCount ?? booksResult.books.length
                }
                lists={publicLists}
              />
            </div>

            {!owner.creator ? (
              <div
                x-show="tab === 'posts'"
                x-cloak
                class="mx-auto flex w-full max-w-[600px] flex-col gap-4"
              >
                {posts.length === 0 ? (
                  <p class="text-sm text-on-surface">No posts yet.</p>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      post={post}
                      author={{
                        shelfSlug: owner.shelfSlug,
                        firstName: owner.firstName,
                        lastName: owner.lastName,
                        profileImageUrl: owner.profileImageUrl,
                      }}
                      likeCount={postLikeStats.get(post.id)?.likeCount ?? 0}
                      likedByMe={postLikeStats.get(post.id)?.likedByMe ?? false}
                    />
                  ))
                )}
              </div>
            ) : null}

            <div x-show="tab === 'contributions'" x-cloak>
              <BooksGrid
                user={user}
                currentPath={currentPath}
                result={{
                  books: contributions,
                  totalPages: 1,
                  page: 1,
                }}
                isPaginated={false}
                noResultsMessage="No contributions yet."
              />
            </div>
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
