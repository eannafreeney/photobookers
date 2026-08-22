import FormPost from "../../../../../components/forms/FormPost";
import TextArea from "../../../../../components/forms/TextArea";
import FormButtons from "../../../../../components/forms/FormButtons";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Link from "../../../../../components/app/Link";
import { getDisplayName } from "../../../../app/services";

type Props = {
  comment: {
    id: string;
    body: string;
    book: { id: string; title: string; slug: string } | null;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  };
};

const EditCommentForm = ({ comment }: Props) => {
  const initialForm = { body: comment.body ?? "" };

  return (
    <div class="flex flex-col gap-6 max-w-2xl">
      <SectionTitle>Edit Comment</SectionTitle>
      <div class="text-sm text-on-surface space-y-1">
        <p>
          <span class="text-on-surface-weak">Book: </span>
          {comment.book ? (
            <Link href={`/books/${comment.book.slug}`} target="_blank">
              {comment.book.title}
            </Link>
          ) : (
            "-"
          )}
        </p>
        <p>
          <span class="text-on-surface-weak">User: </span>
          {getDisplayName(comment.user)}
          {comment.user?.email ? ` (${comment.user.email})` : ""}
        </p>
      </div>
      <FormPost
        action={`/dashboard/admin/comments/${comment.id}`}
        x-data={`commentForm({initialValues: ${JSON.stringify(initialForm)}})`}
        x-target="toast"
      >
        <TextArea
          label="Comment"
          name="body"
          placeholder="Comment body"
          maxLength={1000}
          required
        />
        <FormButtons buttonText="Save Comment" loadingText="Saving..." />
      </FormPost>
    </div>
  );
};

export default EditCommentForm;
