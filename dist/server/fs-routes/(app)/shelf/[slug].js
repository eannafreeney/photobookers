import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import { slugSchema } from "../../../features/app/schema.js";
import { getUser } from "../../../utils.js";
import {
  getPublicBooksInWishlist,
  getPublicShelfBySlug
} from "../../../domain/shelf/services.js";
import { getPublicListsForUser } from "../../../domain/lists/services.js";
import InfoPage from "../../../pages/InfoPage.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import BooksGrid from "../../../features/app/components/BooksGrid.js";
import ShareButton from "../../../features/api/components/ShareButton.js";
import { canonicalUrl, pageTitle, shelfDescription } from "../../../lib/seo.js";
import { routeParam } from "../../../lib/routeParam.js";
import {
  shelfProfileUrl,
  shelfShareText,
  shelfShareTitle
} from "../../../lib/share.js";
import { getInitialsAvatar } from "../../../lib/avatar.js";
import { listPosts } from "../../../db/queries.js";
import { getPostLikeStats } from "../../../domain/posts/likes.js";
import { getPublishedContributionsByUserId } from "../../../domain/contributors/services.js";
import PostCard from "../../../features/collectors/components/PostCard.js";
import CollectorFollowButton from "../../../features/api/components/CollectorFollowButton.js";
import ShelfListsSection from "../../../features/app/components/ShelfListsSection.js";
import VerificationBadge from "../../../components/app/VerificationBadge.js";
const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => {
    const slug = routeParam(c, "slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);
    const [ownerError, ownerResult] = await getPublicShelfBySlug(slug);
    if (ownerError || !ownerResult) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: ownerError?.reason ?? "Shelf not found",
            user
          }
        ),
        404
      );
    }
    const { user: owner } = ownerResult;
    const [booksError, booksResult] = await getPublicBooksInWishlist(
      owner.id,
      currentPage
    );
    if (booksError || !booksResult) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: booksError?.reason ?? "Failed to load shelf",
            user
          }
        )
      );
    }
    if (!user) {
      c.header("Vary", "Cookie");
      c.header(
        "Cache-Control",
        "private, max-age=120, stale-while-revalidate=600"
      );
    } else {
      c.header("Cache-Control", "private, no-store");
    }
    const posts = owner.creator ? [] : await listPosts(owner.id);
    const postLikeStats = await getPostLikeStats(
      posts.map((post) => post.id),
      user?.id
    );
    const [listsErr, publicLists] = await getPublicListsForUser(owner.id);
    if (listsErr || !publicLists) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: listsErr?.reason ?? "Failed to load lists",
            user
          }
        )
      );
    }
    const contributions = await getPublishedContributionsByUserId(owner.id);
    const title = pageTitle(`${owner.displayName}'s shelf`);
    const description = shelfDescription(
      owner.displayName,
      booksResult.totalCount ?? booksResult.books.length
    );
    const shelfCanonicalUrl = canonicalUrl(c.req.url, shelfProfileUrl(slug));
    const avatarUrl = owner.profileImageUrl ?? getInitialsAvatar(owner.firstName ?? "", owner.lastName ?? "");
    const shareImage = owner.profileImageUrl ?? booksResult.books[0]?.coverUrl ?? void 0;
    const isOwner = user?.id === owner.id;
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: shelfCanonicalUrl,
          user,
          currentPath,
          shareOg: {
            title: shelfShareTitle(owner.displayName),
            description,
            url: shelfCanonicalUrl,
            image: shareImage
          },
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs(
            "div",
            {
              class: "flex flex-col gap-4",
              "x-data": "{ tab: new URLSearchParams(window.location.search).get('tab') || 'favourites' }",
              children: [
                isOwner ? /* @__PURE__ */ jsxs("p", { class: "rounded border border-outline bg-surface-alt px-4 py-3 text-sm text-on-surface", children: [
                  "This is your public shelf.",
                  " ",
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: "/dashboard/shelf",
                      class: "text-accent underline underline-offset-2",
                      children: "Manage sharing settings"
                    }
                  )
                ] }) : null,
                /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4 border-b-2 border-on-surface-strong pb-4 md:flex-row md:items-end md:justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-4", children: [
                    /* @__PURE__ */ jsxs("div", { class: "relative shrink-0", children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: avatarUrl,
                          alt: owner.displayName,
                          class: "size-14 rounded-full object-cover",
                          loading: "lazy"
                        }
                      ),
                      !owner.creator ? /* @__PURE__ */ jsx("div", { class: "absolute -top-1 -right-1", children: /* @__PURE__ */ jsx(
                        VerificationBadge,
                        {
                          creatorStatus: "verified",
                          size: "sm",
                          title: "Verified Collector"
                        }
                      ) }) : null
                    ] }),
                    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
                      /* @__PURE__ */ jsx("h1", { class: "text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-6xl", children: `${owner.displayName}'s shelf` }),
                      owner.creator?.slug ? /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: `/creators/${owner.creator.slug}`,
                          class: "text-sm text-accent underline underline-offset-2",
                          children: [
                            "Also a creator \u2192 ",
                            owner.creator.displayName
                          ]
                        }
                      ) : null
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      class: `grid w-full gap-2 md:w-auto md:min-w-72 md:gap-4 ${isOwner ? "grid-cols-1" : "grid-cols-2"}`,
                      children: [
                        !isOwner ? /* @__PURE__ */ jsx(
                          CollectorFollowButton,
                          {
                            targetUserId: owner.id,
                            user
                          }
                        ) : null,
                        /* @__PURE__ */ jsx(
                          ShareButton,
                          {
                            title: shelfShareTitle(owner.displayName),
                            text: shelfShareText(owner.displayName),
                            url: shelfProfileUrl(slug)
                          }
                        )
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { class: "flex gap-2", role: "tablist", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      "x-on:click": "tab = 'favourites'",
                      "x-bind:class": "tab === 'favourites' ? 'border-b-2 border-accent text-on-surface-strong' : 'text-on-surface-weak'",
                      class: "px-3 py-2 text-sm font-medium cursor-pointer",
                      children: "Favourites"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      "x-on:click": "tab = 'lists'",
                      "x-bind:class": "tab === 'lists' ? 'border-b-2 border-accent text-on-surface-strong' : 'text-on-surface-weak'",
                      class: "px-3 py-2 text-sm font-medium cursor-pointer",
                      children: `Lists (${publicLists.length})`
                    }
                  ),
                  owner.creator ? /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: `/creators/${owner.creator.slug}`,
                      class: "px-3 py-2 text-sm font-medium text-accent underline underline-offset-2",
                      children: "Posts on creator profile \u2192"
                    }
                  ) : /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      "x-on:click": "tab = 'posts'",
                      "x-bind:class": "tab === 'posts' ? 'border-b-2 border-accent text-on-surface-strong' : 'text-on-surface-weak'",
                      class: "px-3 py-2 text-sm font-medium cursor-pointer",
                      children: `Posts (${posts.length})`
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      "x-on:click": "tab = 'contributions'",
                      "x-bind:class": "tab === 'contributions' ? 'border-b-2 border-accent text-on-surface-strong' : 'text-on-surface-weak'",
                      class: "px-3 py-2 text-sm font-medium cursor-pointer",
                      children: `Contributions (${contributions.length})`
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { "x-show": "tab === 'favourites'", id: "favourites", children: /* @__PURE__ */ jsx(
                  BooksGrid,
                  {
                    user,
                    currentPath,
                    result: booksResult,
                    noResultsMessage: "No public favorites yet."
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { "x-show": "tab === 'lists'", "x-cloak": true, children: /* @__PURE__ */ jsx(ShelfListsSection, { shelfSlug: slug, lists: publicLists }) }),
                !owner.creator ? /* @__PURE__ */ jsx(
                  "div",
                  {
                    "x-show": "tab === 'posts'",
                    "x-cloak": true,
                    class: "mx-auto flex w-full max-w-[600px] flex-col gap-4",
                    children: posts.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "No posts yet." }) : posts.map((post) => /* @__PURE__ */ jsx(
                      PostCard,
                      {
                        post,
                        author: {
                          shelfSlug: owner.shelfSlug,
                          firstName: owner.firstName,
                          lastName: owner.lastName,
                          profileImageUrl: owner.profileImageUrl
                        },
                        likeCount: postLikeStats.get(post.id)?.likeCount ?? 0,
                        likedByMe: postLikeStats.get(post.id)?.likedByMe ?? false
                      }
                    ))
                  }
                ) : null,
                /* @__PURE__ */ jsx("div", { "x-show": "tab === 'contributions'", "x-cloak": true, children: /* @__PURE__ */ jsx(
                  BooksGrid,
                  {
                    user,
                    currentPath,
                    result: {
                      books: contributions,
                      totalPages: 1,
                      page: 1
                    },
                    isPaginated: false,
                    noResultsMessage: "No contributions yet."
                  }
                ) })
              ]
            }
          ) })
        }
      )
    );
  }
);
export {
  GET
};
