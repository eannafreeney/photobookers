import { log } from "console";
import { AuthUser } from "../../../../types";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import Link from "../../../components/app/Link";
import { formatDate } from "../../../utils";
import { getDisplayName } from "../services";
import { getBookComments } from "../services";

type CommentsSectionProps = {
  bookId: string;
  user: AuthUser | null;
  bookSlug: string;
}

  const CommentsSection = async ({
    bookId,
    user,
    bookSlug,
  }: CommentsSectionProps) =>  {
    const hasProfilePic = !!(user?.creator?.coverUrl || user?.profileImageUrl);

    return (
    <div id="comments-list" class="flex flex-col border-t border-surface-alt">
        <h3 class="text-base font-semibold text-on-surface-strong mb-2">What did you love about this book?</h3>
       <CommentList bookId={bookId} bookSlug={bookSlug} user={user} />
   
       {!hasProfilePic ? ( 
    <div class="flex flex-col items-start gap-1">
      <Link href={`/users/${user?.id}/update`} xTarget="modal-root" className="btn btn-sm">
        Add Photo
      </Link>
      <p class="text-xs text-on-surface-weak">Add a profile photo to comment.</p>
    </div>
  ) : (
    <Link href={`/comments/${bookId}`} xTarget="modal-root" className="btn btn-sm">
      Add Comment
    </Link>
  )}
    </div>
  );
}

export default CommentsSection;


const CommentList = async ({ bookId, bookSlug, user }: CommentsSectionProps) => {
    const [err, comments] = await getBookComments(bookId);

    if(err) return <p class="text-sm text-on-surface-weak">{err.reason}</p>;

    const alpineAttrs = {
        "x-init": "true",
        "@comments:updated.window":
          `$ajax('/books/${bookSlug}', { target: 'comments-list' })`,
      };

      console.log('comments', comments.map((comment) => comment.user?.creators[0]));
      console.log('user', user);

    return (
    <div  class="flex flex-col gap-3" {...alpineAttrs}>
        {comments.length === 0 ? (
          <p class="text-sm text-on-surface-weak">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const creator = comment.user?.creators?.[0] ?? null;

            return (
            <div key={comment.id} class="rounded-radius border border-surface-alt">
              <div class="mb-2 flex items-center justify-between gap-2">
              {creator ? (
  <CardCreatorCard creator={creator} user={user} />
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
              <p class="text-sm text-on-surface">{comment.body}</p>
            </div>
          )})
        )}
      </div>
)}

// const CommentForm = async ({ bookId, user }: { bookId: string, user: AuthUser | null }) => {

//     const alpineAttrs = {
//       "x-target": "modal-root",
//       "x-target.error": "toast",
//       "x-target.401": "modal-root",
//       "@ajax:after": "dispatch('comments:updated')",
//     };

//     if (!user) {
//       return <p class="text-sm text-on-surface-weak">Log in to add a comment.</p>;
//     }

//     if (!user.profileImageUrl) {
//       return (
//         <div class="mt-4">

//         <Link href={`/users/${user.id}/update`} xTarget="modal-root">
//         <p class="text-sm text-on-surface-weak">
//           Add a profile picture to your account before commenting.
//         </p>
//         </Link>
//         </div>
//       );
//     }

//   return (   
//     <>
//     {!user.profileImageUrl && <UserCoverForm initialUrl={user.profileImageUrl} user={user} />}
//         <form
//           method="post"
//           action={`/api/books/${bookId}/comments`}
//           class="flex flex-col gap-4"
//           {...alpineAttrs}
//           >
//           <label
//         class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary"
//         >
//         <textarea
//           class="w-full bg-surface-alt px-2.5 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
//           name="body"
//           placeholder="Add a comment..."
//           rows={3}
//           required
//           />
//       </label>
//           <Button variant="solid" color="primary" width="fit" isDisabled={!user.profileImageUrl}>
//             Add Comment
//           </Button>
//         </form>         
//           </>
//   )
// }
