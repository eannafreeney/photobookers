import { AuthUser } from "../../../../types";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import Link from "../../../components/app/Link";
import FormDelete from "../../../components/forms/FormDelete";
import { formatDate } from "../../../utils";
import { getBookComments, getDisplayName } from "../services";

type CommentsResult = Awaited<ReturnType<typeof getBookComments>>;
type CommentWithUser = NonNullable<CommentsResult[1]>[number];

type CommentListProps = {
  bookId: string;
  user: AuthUser | null;
  comments: CommentWithUser[];
};

const CommentsList = async ({ bookId, user, comments }: CommentListProps) => {
  if (comments.length === 0)
    return (
      <p class="text-sm text-center text-on-surface border border-outline rounded-radius p-4 bg-surface-alt my-2">
        No comments yet. Be the first to comment!
      </p>
    );

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
                <p class="text-xs text-on-surface">
                  {formatDate(comment.createdAt)}
                </p>
              )}
            </div>
            <div class="flex items-start justify-between">
              <CommentBody body={comment.body} />
              {user?.id === comment.userId && (
                <div class="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                  <Link
                    href={`/api/books/${bookId}/comments/${comment.id}`}
                    xTarget="modal-root"
                    hoverUnderline
                  >
                    edit
                  </Link>
                  {/* <DeleteCommentButton commentId={comment.id} bookId={bookId} /> */}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentsList;

const CommentBody = ({ body }: { body: string }) => (
  <div x-data="{ expanded: false }" class="text-sm text-on-surface pr-2">
    <p x-show={`!expanded && ${body.length} > 130 `}>{body.slice(0, 130)}...</p>
    <p x-show={`expanded || ${body.length} <= 130`}>{body}</p>
    {body.length > 130 && (
      <button
        type="button"
        class="mt-1 text-xs text-on-surface hover:underline cursor-pointer"
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
    "@ajax:success": "$el.closest('div').remove()",
  };
  return (
    <FormDelete
      action={`/api/books/${bookId}/comments/${commentId}`}
      {...alpineAttrs}
    >
      <button class="cursor-pointer hover:underline" type="submit">
        <span class="text-xs text-on-surface">delete</span>
      </button>
    </FormDelete>
  );
};
