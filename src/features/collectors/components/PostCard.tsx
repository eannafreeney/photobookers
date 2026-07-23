import { CollectorPost } from "../../../db/schema";
import { getInitialsAvatar } from "../../../lib/avatar";

export type PostAuthor = {
  shelfSlug: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
};

type PostCardProps = {
  post: Pick<CollectorPost, "id" | "body" | "imageUrl" | "createdAt">;
  author: PostAuthor;
};

const authorName = (author: PostAuthor) =>
  [author.firstName, author.lastName].filter(Boolean).join(" ").trim() ||
  "Collector";

const PostCard = ({ post, author }: PostCardProps) => {
  const name = authorName(author);
  const avatarUrl =
    author.profileImageUrl ??
    getInitialsAvatar(author.firstName ?? "", author.lastName ?? "");
  const header = (
    <div class="flex items-center gap-2 min-w-0">
      <img
        src={avatarUrl}
        alt={name}
        class="size-8 rounded-full object-cover"
        loading="lazy"
      />
      <span class="truncate text-sm font-medium text-on-surface-strong">
        {name}
      </span>
    </div>
  );

  return (
    <article class="rounded-radius border border-outline bg-surface p-4 shadow-sm">
      <header class="mb-3 flex items-center justify-between gap-3">
        {author.shelfSlug ? (
          <a href={`/shelf/${author.shelfSlug}`}>{header}</a>
        ) : (
          header
        )}
        <time class="shrink-0 text-xs text-on-surface">
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString()
            : ""}
        </time>
      </header>
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
    </article>
  );
};

export default PostCard;
