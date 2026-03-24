import { AuthUser } from "../../../../types";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import Link from "../../../components/app/Link";
import { formatDate } from "../../../utils";
import { getDisplayName } from "../services";
import { getBookComments } from "../services";
import Button from "../../../components/app/Button";

type CommentsResult = Awaited<ReturnType<typeof getBookComments>>;
type CommentWithUser = NonNullable<CommentsResult[1]>[number];

type CommentsSectionProps = {
  bookId: string;
  user: AuthUser | null;
  bookSlug: string;
};

const CommentsSection = async ({
  bookId,
  user,
  bookSlug,
}: CommentsSectionProps) => {
  const [err, comments] = await getBookComments(bookId);

  if (err) return <p class="text-sm text-on-surface-weak">{err.reason}</p>;

  const hasUserCommented =
    !!user?.id && !err && comments.some((c) => c.userId === user.id);

  const alpineAttrs = {
    "x-init": "true",
    "@comments:updated.window": `$ajax('/books/${bookSlug}', { target: 'comments-list' })`,
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
      <CommentList bookId={bookId} comments={comments} user={user} />
      {!hasProfilePic ? (
        <div class="flex flex-col items-start gap-1 mt-2">
          <Link href={`/users/${user?.id}/update`} xTarget="modal-root">
            <Button variant="outline" color="primary" width="fit">
              Add Photo
            </Button>
          </Link>
          <p class="text-xs text-on-surface-weak">
            Add a profile photo to comment.
          </p>
        </div>
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

type CommentListProps = {
  bookId: string;
  user: AuthUser | null;
  comments: CommentWithUser[];
};

const CommentList = async ({ bookId, user, comments }: CommentListProps) => {
  if (comments.length === 0) return <></>;

  return (
    <div class="flex flex-col gap-2 w-full my-4">
      {comments.map((comment) => {
        const creator = comment.user?.creators?.[0] ?? null;

        return (
          <div key={comment.id} class="border-b border-outline pb-2">
            <div class="mb-2 flex items-center justify-between gap-2">
              {creator ? (
                <CardCreatorCard creator={creator} />
              ) : (
                <div class="flex items-center gap-2">
                  <img
                    src={comment.user?.profileImageUrl ?? ""}
                    alt={getDisplayName(comment.user)}
                    class="h-6 w-6 rounded-full object-cover"
                  />
                  <p class="text-sm font-medium text-on-surface-strong">
                    {getDisplayName(comment.user)}
                  </p>
                </div>
              )}
              {comment.createdAt && (
                <p class="text-xs text-on-surface-weak">
                  {formatDate(comment.createdAt)}
                </p>
              )}
            </div>
            <div class="flex items-start justify-between">
              <CommentBody body={comment.body} />
              {user?.id === comment.userId && (
                <div class="flex items-center gap-2 text-xs text-on-surface-weak cursor-pointer">
                  <Link
                    href={`/api/books/${bookId}/update/${comment.id}`}
                    xTarget="modal-root"
                    hoverUnderline
                  >
                    edit
                  </Link>
                  <DeleteCommentButton commentId={comment.id} bookId={bookId} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CommentBody = ({ body }: { body: string }) => (
  <div x-data="{ expanded: false }" class="text-sm text-on-surface pr-2">
    <p x-show={`!expanded && ${body.length} > 130 `}>{body.slice(0, 130)}...</p>
    <p x-show={`expanded || ${body.length} <= 130`}>{body}</p>
    {body.length > 130 && (
      <button
        type="button"
        class="mt-1 text-xs text-on-surface-weak hover:underline cursor-pointer"
        x-on:click="expanded = !expanded"
        x-text="expanded ? 'Show less' : 'Show more'"
      />
    )}
  </div>
);

const DeleteCommentButton = async ({
  commentId,
  bookId,
}: {
  commentId: string;
  bookId: string;
}) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };
  return (
    <form
      method="post"
      action={`/api/books/${bookId}/delete/${commentId}`}
      {...alpineAttrs}
    >
      <button class="cursor-pointer hover:underline" type="submit">
        <span class="text-xs text-on-surface-weak">delete</span>
      </button>
    </form>
  );
};
