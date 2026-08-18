import Badge from "../../../../components/app/Badge";
import { Creator, Post } from "../../../../db/schema";
import PostLikeButton from "../../../collectors/components/PostLikeButton";

type CreatorPostProps = {
  creator: Pick<Creator, "id" | "slug" | "displayName" | "coverUrl">;
  post: Post;
  canReadPosts?: boolean;
  likeCount?: number;
  likedByMe?: boolean;
};

const CreatorPost = ({
  creator,
  post,
  canReadPosts = true,
  likeCount = 0,
  likedByMe = false,
}: CreatorPostProps) => {
  const redactClass = !canReadPosts
    ? "select-none blur-[3px] pointer-events-none"
    : "";

  return (
    <article class="rounded-radius border border-outline bg-surface p-4 shadow-sm">
      <header class="mb-3 flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <a href={`/creators/${creator.slug}`} class="min-w-0">
            <div class="flex items-center gap-2 min-w-0">
              <img
                src={creator.coverUrl ?? ""}
                alt={creator.displayName}
                class="size-8 rounded-full object-cover"
              />
              <span class="truncate text-sm font-medium text-on-surface-strong">
                {creator.displayName}
              </span>
            </div>
          </a>
          <Badge variant="accent">Creator</Badge>
        </div>
        <time class="shrink-0 text-xs text-on-surface">
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
        </time>
      </header>
      <div class="relative">
        <div class={redactClass}>
          <p class="whitespace-pre-wrap text-sm text-on-surface">{post.body}</p>
          {post.imageUrl && (
            <div class="mt-3">
              <img
                src={post.imageUrl}
                alt="Post image"
                class="w-full rounded-radius object-cover border border-outline"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {!canReadPosts && (
          <div class="absolute inset-0 grid place-items-center">
            <div class="rounded-full border border-outline bg-surface/90 px-3 py-1 text-xs font-medium text-on-surface-strong shadow-sm">
              Follow to unlock
            </div>
          </div>
        )}
      </div>
      {canReadPosts ? (
        <PostLikeButton
          postId={post.id}
          likedByMe={likedByMe}
          likeCount={likeCount}
        />
      ) : null}
    </article>
  );
};

export default CreatorPost;
