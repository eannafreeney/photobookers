import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { z } from "zod";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import InfoPage from "../../../pages/InfoPage.js";
import PostCard from "../../../features/collectors/components/PostCard.js";
import { getPublicPostById } from "../../../domain/posts/services.js";
import { getPostLikeStats } from "../../../domain/posts/likes.js";
import { getUser } from "../../../utils.js";
import { paramValidator } from "../../../lib/validator.js";
import { canonicalUrl, pageTitle } from "../../../lib/seo.js";
import { absoluteShareImageUrl, postPath } from "../../../lib/share.js";
import { routeParam } from "../../../lib/routeParam.js";
const postIdSchema = z.object({
  id: z.string().trim().uuid("Invalid post link")
});
const GET = createRoute(
  paramValidator(postIdSchema),
  async (c) => {
    const postId = routeParam(c, "id");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const [error, result] = await getPublicPostById(postId);
    if (error || !result) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: error?.reason ?? "Post not found",
            user
          }
        ),
        404
      );
    }
    const { post, author, creator } = result;
    const authorName = creator?.displayName ?? ([author.firstName, author.lastName].filter(Boolean).join(" ").trim() || "Collector");
    const likeStats = await getPostLikeStats([post.id], user?.id);
    const stats = likeStats.get(post.id);
    const origin = new URL(c.req.url).origin;
    const shareUrl = `${origin}${postPath(post.id)}`;
    const shareImage = absoluteShareImageUrl(
      post.imageUrl ?? creator?.coverUrl ?? author.profileImageUrl,
      origin
    );
    const description = post.body.length > 160 ? `${post.body.slice(0, 157)}\u2026` : post.body;
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: pageTitle(`Post by ${authorName}`),
          description,
          canonicalUrl: canonicalUrl(c.req.url, `/posts/${post.id}`),
          user,
          currentPath,
          shareOg: {
            title: `Post by ${authorName}`,
            description,
            url: shareUrl,
            image: shareImage
          },
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx("div", { class: "mx-auto w-full max-w-xl", children: /* @__PURE__ */ jsx(
            PostCard,
            {
              post,
              author,
              creator: creator ?? void 0,
              likeCount: stats?.likeCount ?? 0,
              likedByMe: stats?.likedByMe ?? false,
              showOpenLink: false
            }
          ) }) })
        }
      )
    );
  }
);
export {
  GET
};
