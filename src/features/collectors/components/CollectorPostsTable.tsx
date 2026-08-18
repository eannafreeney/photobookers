import { CollectorPost } from "../../../db/schema";
import { formatDate } from "../../../utils";
import { listCollectorPosts } from "../../../db/queries";
import { getPostLikeStats } from "../../../domain/posts/likes";
import EditRowButton from "@/features/app/components/EditRowButton";
import DeleteRowButton from "@/features/app/components/DeleteRowButton";

type Props = {
  userId: string;
  isMobile?: boolean;
};

const alpineAttrs = {
  "x-init": "true",
  "@posts:updated.window":
    "$ajax('/dashboard/posts', { target: 'posts-table-container' })",
};

const CollectorPostsTable = async ({ userId, isMobile = false }: Props) => {
  const posts = await listCollectorPosts(userId);
  const likeStats = await getPostLikeStats(posts.map((post) => post.id));

  if (posts.length === 0) {
    return (
      <div x-data id="posts-table-container" {...alpineAttrs}>
        <div class="rounded border border-outline bg-surface-alt p-6 text-sm text-on-surface">
          <p>No posts yet. Publish your first post above.</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <ul
        x-data
        id="posts-table-container"
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        {posts.map((post) => (
          <CollectorPostCard
            post={post}
            likeCount={likeStats.get(post.id)?.likeCount ?? 0}
          />
        ))}
      </ul>
    );
  }

  return (
    <div
      x-data
      id="posts-table-container"
      class="overflow-x-auto border border-outline"
      {...alpineAttrs}
    >
      <table class="w-full text-left text-sm">
        <thead class="border-b border-outline bg-surface-alt kicker text-on-surface-weak">
          <tr>
            <th class="px-4 py-3 font-medium">Date</th>
            <th class="px-4 py-3 font-medium">Image</th>
            <th class="px-4 py-3 font-medium">Body</th>
            <th class="px-4 py-3 font-medium">Likes</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <CollectorPostRow
              post={post}
              likeCount={likeStats.get(post.id)?.likeCount ?? 0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const postDateLabel = (post: CollectorPost) =>
  post.createdAt ? formatDate(new Date(post.createdAt)) : "—";

const postExcerpt = (body: string) =>
  body.length > 100 ? body.slice(0, 100) + "..." : body;

const CollectorPostCard = ({
  post,
  likeCount,
}: {
  post: CollectorPost;
  likeCount: number;
}) => {
  const editHref = `/dashboard/posts/${post.id}`;

  return (
    <li class="rounded-radius border border-outline bg-surface overflow-hidden">
      <div class="flex flex-col gap-4 p-4">
        <div class="flex gap-3">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt="Post image"
              class="h-20 w-14 shrink-0 object-cover rounded-sm"
            />
          ) : null}
          <div class="min-w-0 flex-1">
            <p class="text-sm text-on-surface-weak">{postDateLabel(post)}</p>
            <p class="mt-1 text-sm text-on-surface line-clamp-3">
              {postExcerpt(post.body)}
            </p>
          </div>
        </div>
        <dl class="grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-3 text-sm">
          <dt class="text-on-surface-weak">Likes</dt>
          <dd class="tabular-nums">{likeCount}</dd>
        </dl>
        <div class="flex flex-wrap justify-evenly items-center gap-2 border-t border-outline pt-3">
          <EditRowButton href={editHref} xTarget="modal-root" />
          <DeleteRowButton
            action={`/dashboard/posts/${post.id}`}
            confirm="Delete this post?"
          />
        </div>
      </div>
    </li>
  );
};

const CollectorPostRow = ({
  post,
  likeCount,
}: {
  post: CollectorPost;
  likeCount: number;
}) => {
  const editHref = `/dashboard/posts/${post.id}`;

  return (
    <tr class="border-b border-outline last:border-0">
      <td class="px-4 py-3">{postDateLabel(post)}</td>
      <td class="px-4 py-3">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt="Post image"
            class="h-12 w-12 rounded-radius border border-outline object-cover"
          />
        ) : (
          <span class="text-on-surface-weak">—</span>
        )}
      </td>
      <td class="px-4 py-3">
        <span class="text-on-surface-weak">{postExcerpt(post.body)}</span>
      </td>
      <td class="px-4 py-3 tabular-nums">{likeCount}</td>
      <td class="px-4 py-3 text-right">
        <div class="flex items-center justify-end gap-2">
          <EditRowButton href={editHref} xTarget="modal-root" />
          <DeleteRowButton
            action={`/dashboard/posts/${post.id}`}
            confirm="Delete this post?"
          />
        </div>
      </td>
    </tr>
  );
};

export default CollectorPostsTable;
