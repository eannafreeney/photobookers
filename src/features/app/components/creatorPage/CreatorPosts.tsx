import { AuthUser } from "../../../../../types";
import { findFollow } from "../../../../db/queries";
import { listPostsByCreatorSlug } from "../../../../domain/posts/services";
import { getPostLikeStats } from "../../../../domain/posts/likes";
import CreatorPost from "./CreatorPost";
import ListNavigation from "../ListNavigation";

type Props = {
  creatorSlug: string;
  user: AuthUser | null;
};

const CreatorPosts = async ({ creatorSlug, user }: Props) => {
  const [error, result] = await listPostsByCreatorSlug(creatorSlug, 1, 5);
  if (error || !result) return <></>;

  const { posts, totalPages, page, creator } = result;

  const isOwner = user?.creator?.id === creator.id;

  const canReadPosts =
    isOwner ||
    user?.isAdmin ||
    (user?.id ? Boolean(await findFollow(creator.id, user.id)) : false);

  const targetId = `creator-posts-${creator.id}`;
  const likeStats = await getPostLikeStats(
    posts.map((post) => post.id),
    user?.id,
  );

  return (
    <div
      id={targetId}
      class="w-full flex flex-col gap-4"
      x-data
      {...{
        "@creator-posts:updated.window": `$ajax('/creators/${creator.slug}', { target: '${targetId}' })`,
      }}
    >
      {posts.length === 0 ? (
        <div class="rounded-radius border border-outline bg-surface-alt p-6 text-sm text-on-surface">
          {isOwner ? (
            <>
              <p class="font-medium text-on-surface-strong">No posts yet</p>
              <p class="mt-2 text-pretty">
                Share fair dates, work-in-progress shots, or news with people
                who follow you.
              </p>
              <a
                href="/dashboard/posts"
                class="mt-4 inline-block text-sm font-medium text-accent hover:underline"
              >
                Write your first post →
              </a>
            </>
          ) : canReadPosts ? (
            <p>
              No posts yet. Check back soon for updates from{" "}
              {creator.displayName}.
            </p>
          ) : (
            <p>
              No posts yet. Follow {creator.displayName} to see updates here.
            </p>
          )}
        </div>
      ) : (
        posts.map((post) => (
          <CreatorPost
            creator={creator}
            post={post}
            canReadPosts={canReadPosts}
            likeCount={likeStats.get(post.id)?.likeCount ?? 0}
            likedByMe={likeStats.get(post.id)?.likedByMe ?? false}
          />
        ))
      )}
      <ListNavigation
        targetId={targetId}
        totalPages={totalPages}
        page={page}
        currentPath={`/creators/${creator.slug}`}
      />
    </div>
  );
};

export default CreatorPosts;
