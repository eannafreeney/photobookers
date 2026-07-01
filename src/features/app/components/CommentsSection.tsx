import { AuthUser } from "../../../../types";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import Link from "../../../components/app/Link";
import { formatDate } from "../../../utils";
import { getDisplayName } from "../services";
import { getBookComments } from "../services";
import Button from "../../../components/app/Button";
import FormDelete from "../../../components/forms/FormDelete";
import CommentsList from "./CommentsList";

type CommentsSectionProps = {
  bookId: string;
  user: AuthUser | null;
  bookSlug: string;
  isMobile?: boolean;
  /** Defaults to `/books/{bookSlug}` for comment list refresh after modal submit. */
  commentsRefreshPath?: string;
};

const CommentsSection = async ({
  bookId,
  user,
  bookSlug,
  isMobile = false,
  commentsRefreshPath,
}: CommentsSectionProps) => {
  const refreshPath = commentsRefreshPath ?? `/books/${bookSlug}`;
  const [err, comments] = await getBookComments(bookId);

  if (err) return <p class="text-sm text-on-surface">{err.reason}</p>;

  const hasUserCommented =
    !!user?.id && !err && comments.some((c) => c.userId === user.id);

  const alpineAttrs = {
    "x-init": "true",
    "@comments:updated.window": `$ajax('${refreshPath}', { target: 'comments-list' })`,
  };

  const hasProfilePic = !!(user?.creator?.coverUrl || user?.profileImageUrl);

  return (
    <div
      id="comments-list"
      class="flex flex-col border-t border-surface-alt"
      {...alpineAttrs}
    >
      <h3 class="text-base font-semibold text-on-surface-strong">
        What did you love about this book?
      </h3>
      <CommentsList bookId={bookId} comments={comments} user={user} />
      {!hasProfilePic ? (
        <form
          method="get"
          action={`/users/${user?.id}/update`}
          x-target="modal-root"
          class="mt-2"
        >
          <input
            type="hidden"
            name="msg"
            value="Add a profile photo first to comment."
          />
          <Button
            type="submit"
            variant="outline"
            color="primary"
            width={isMobile ? "full" : "fit"}
          >
            Add Comment
          </Button>
        </form>
      ) : hasUserCommented ? (
        <></>
      ) : (
        <Link
          href={`/api/books/${bookId}/comments`}
          xTarget="modal-root"
          className="mt-2"
        >
          <Button variant="outline" color="primary" width="fit">
            Add Comment
          </Button>
        </Link>
      )}
    </div>
  );
};

export default CommentsSection;
