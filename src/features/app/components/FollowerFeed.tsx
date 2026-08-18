import { AuthUser } from "../../../../types";
import { FeedItem, FeedTab } from "../followerFeed";
import ListNavigation from "./ListNavigation";
import FeedBookCard from "@/components/app/FeedBookCard";
import PostCard from "../../collectors/components/PostCard";
import { getPostLikeStats } from "../../../domain/posts/likes";

type Props = {
  user: AuthUser;
  tab: FeedTab;
  currentPath: string;
  items: FeedItem[];
  totalPages: number;
  page: number;
};

const emptyCopy: Record<FeedTab, string> = {
  posts:
    "Start following artists, publishers, and collectors to see their posts here.",
  books:
    "Start following artists and publishers to see their latest releases here.",
};

const FollowerFeed = async ({
  user,
  tab,
  currentPath,
  items,
  totalPages,
  page,
}: Props) => {
  const targetId = "feed-items";
  const postIds = items.flatMap((item) =>
    item.kind === "post" ? [item.post.id] : [],
  );
  const likeStats = await getPostLikeStats(postIds, user.id);

  return (
    <>
      {items.length === 0 ? (
        <p class="text-on-surface">{emptyCopy[tab]}</p>
      ) : (
        <div id={targetId} x-merge="append" class="flex flex-col gap-4">
          {items.map((item) =>
            item.kind === "post" ? (
              <PostCard
                post={item.post}
                author={item.post.author}
                creator={item.post.creator}
                likeCount={likeStats.get(item.post.id)?.likeCount ?? 0}
                likedByMe={likeStats.get(item.post.id)?.likedByMe ?? false}
              />
            ) : (
              <FeedBookCard
                book={item.book}
                user={user}
                className="w-full max-w-none"
              />
            ),
          )}
        </div>
      )}
      <ListNavigation
        isInfiniteScroll
        targetId={targetId}
        totalPages={totalPages}
        page={page}
        currentPath={currentPath}
      />
    </>
  );
};

export default FollowerFeed;
