import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import CreatorMessage from "./CreatorMessage";
import { FeedItem } from "../followerFeed";
import ListNavigation from "./ListNavigation";
import FeedBookCard from "@/components/app/FeedBookCard";

type Props = {
  user: AuthUser;
  currentPath: string;
  items: FeedItem[];
  totalPages: number;
  page: number;
};

const FollowerFeed = ({
  user,
  currentPath,
  items,
  totalPages,
  page,
}: Props) => {
  const targetId = "feed-items";

  return (
    <>
      {items.length === 0 ? (
        <p class="text-on-surface">
          Start following artists and publishers to see their latest releases
          and updates here.
        </p>
      ) : (
        <div id={targetId} x-merge="append" class="flex flex-col gap-4">
          {items.map((item) =>
            item.kind === "message" ? (
              <CreatorMessage
                canReadMessages
                creator={item.message.creator}
                message={item.message}
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
