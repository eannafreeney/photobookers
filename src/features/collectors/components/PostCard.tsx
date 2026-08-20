import { Post } from "../../../db/schema";
import { getInitialsAvatar } from "../../../lib/avatar";
import { postPath, postShareText, postUrl } from "../../../lib/share";
import ShareButton from "../../api/components/ShareButton";
import PostLikeButton from "./PostLikeButton";

export type PostAuthor = {
  shelfSlug: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
};

export type PostCreator = {
  slug: string;
  displayName: string;
  coverUrl: string | null;
};

type PostCardProps = {
  post: Pick<Post, "id" | "body" | "imageUrl" | "createdAt">;
  author: PostAuthor;
  creator?: PostCreator;
  likeCount?: number;
  likedByMe?: boolean;
  showLike?: boolean;
  showShare?: boolean;
  /** Link to the post permalink page. Hide when already there. */
  showOpenLink?: boolean;
};

const authorName = (author: PostAuthor) =>
  [author.firstName, author.lastName].filter(Boolean).join(" ").trim() ||
  "Collector";

const PostCard = ({
  post,
  author,
  creator,
  likeCount = 0,
  likedByMe = false,
  showLike = true,
  showShare = true,
  showOpenLink = true,
}: PostCardProps) => {
  const name = creator?.displayName ?? authorName(author);
  const avatarUrl = creator
    ? (creator.coverUrl ?? getInitialsAvatar(creator.displayName))
    : (author.profileImageUrl ??
      getInitialsAvatar(author.firstName ?? "", author.lastName ?? ""));
  const href = creator
    ? `/creators/${creator.slug}`
    : author.shelfSlug
      ? `/shelf/${author.shelfSlug}`
      : null;
  const shareUrl = postUrl(post.id);

  const header = (
    <div class="flex min-w-0 items-center gap-2">
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
    </div>
  );

  return (
    <article class="rounded-radius border border-outline bg-surface p-4 shadow-sm">
      <header class="mb-3 flex items-center justify-between gap-3">
        {href ? <a href={href}>{header}</a> : header}
        <time class="shrink-0 text-xs text-on-surface">
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
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
      {showLike || showShare ? (
        <div class="mt-3 flex items-center gap-1">
          {showLike ? (
            <PostLikeButton
              postId={post.id}
              likedByMe={likedByMe}
              likeCount={likeCount}
            />
          ) : null}
          {showShare ? (
            <ShareButton
              variant="inline"
              title={`Post by ${name}`}
              text={postShareText(name)}
              url={shareUrl}
            />
          ) : null}
          {showOpenLink ? (
            <a
              href={postPath(post.id)}
              class="ml-auto text-xs text-on-surface-weak hover:text-on-surface-strong hover:underline"
            >
              Open post
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

export default PostCard;
