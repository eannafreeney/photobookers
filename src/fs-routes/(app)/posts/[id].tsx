import { createRoute } from "hono-fsr";
import { z } from "zod";
import { Context } from "hono";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import PostCard from "../../../features/collectors/components/PostCard";
import { getPublicPostById } from "../../../domain/posts/services";
import { getPostLikeStats } from "../../../domain/posts/likes";
import { getUser } from "../../../utils";
import { paramValidator } from "../../../lib/validator";
import { canonicalUrl, pageTitle } from "../../../lib/seo";
import { postUrl } from "../../../lib/share";
import { routeParam } from "../../../lib/routeParam";

const postIdSchema = z.object({
  id: z.string().uuid(),
});

export const GET = createRoute(
  paramValidator(postIdSchema),
  async (c: Context) => {
    const postId = routeParam(c, "id");
    const user = await getUser(c);
    const currentPath = c.req.path;

    const [error, result] = await getPublicPostById(postId);
    if (error || !result) {
      return c.html(
        <InfoPage errorMessage={error?.reason ?? "Post not found"} user={user} />,
        404,
      );
    }

    const { post, author, creator } = result;
    const authorName =
      creator?.displayName ??
      ([author.firstName, author.lastName].filter(Boolean).join(" ").trim() ||
        "Collector");

    const likeStats = await getPostLikeStats([post.id], user?.id);
    const stats = likeStats.get(post.id);
    const shareUrl = postUrl(post.id);
    const description =
      post.body.length > 160 ? `${post.body.slice(0, 157)}…` : post.body;

    return c.html(
      <AppLayout
        title={pageTitle(`Post by ${authorName}`)}
        description={description}
        canonicalUrl={canonicalUrl(c.req.url, `/posts/${post.id}`)}
        user={user}
        currentPath={currentPath}
        shareOg={{
          title: `Post by ${authorName}`,
          description,
          url: shareUrl,
          image: post.imageUrl ?? creator?.coverUrl ?? author.profileImageUrl ?? undefined,
        }}
      >
        <Page>
          <div class="mx-auto w-full max-w-xl">
            <PostCard
              post={post}
              author={author}
              creator={creator ?? undefined}
              likeCount={stats?.likeCount ?? 0}
              likedByMe={stats?.likedByMe ?? false}
              showOpenLink={false}
            />
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
