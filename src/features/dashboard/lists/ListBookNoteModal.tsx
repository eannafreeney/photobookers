import FormButtons from "../../../components/forms/FormButtons";
import FormPost from "../../../components/forms/FormPost";
import Modal from "../../../components/app/Modal";
import TextArea from "../../../components/forms/TextArea";
import type { BookCardResult } from "../../../constants/queries";
import type { BookList } from "../../../db/schema";
import { LIST_ITEM_NOTE_MAX_LENGTH } from "../../../domain/lists/utils";

export type ListNoteCommentOption = {
  id: string;
  body: string;
};

type Props = {
  list: Pick<BookList, "id" | "title">;
  book: BookCardResult;
  note: string | null;
  comments?: ListNoteCommentOption[];
};

const previewComment = (body: string, max = 140) => {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
};

const ListBookNoteModal = ({
  list,
  book,
  note,
  comments = [],
}: Props) => {
  const formValues = { note: note ?? "" };
  const commentBodies = comments
    .map((c) => c.body.trim())
    .filter((body) => body.length > 0);

  const alpineAttrs = {
    "x-data": `listBookNoteForm(${JSON.stringify(formValues)}, ${JSON.stringify(commentBodies)})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast list-books-editor",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess(); $dispatch('dialog:close')",
  };

  return (
    <Modal title="Add a note">
      <div class="mb-4 flex items-center gap-3">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt=""
            class="size-16 shrink-0 object-cover"
          />
        ) : (
          <div class="size-16 shrink-0 bg-surface-alt" />
        )}
        <div class="min-w-0">
          <p class="font-medium text-on-surface-strong">{book.title}</p>
          {book.artist?.displayName ? (
            <p class="text-sm text-on-surface-weak">{book.artist.displayName}</p>
          ) : null}
          {book.publisher?.displayName ? (
            <p class="text-sm text-on-surface-weak">
              {book.publisher.displayName}
            </p>
          ) : null}
          <p class="mt-1 text-xs text-on-surface-weak">In {list.title}</p>
        </div>
      </div>
      <FormPost
        action={`/dashboard/lists/${list.id}/books/${book.id}/note`}
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        {commentBodies.length > 0 ? (
          <div class="flex flex-col gap-2 rounded border border-outline bg-surface-alt p-3">
            <p class="text-xs font-medium text-on-surface-weak">
              {commentBodies.length === 1
                ? "You’ve commented on this book"
                : "You’ve commented on this book — pick one to use as the note"}
            </p>
            <ul class="flex flex-col gap-2">
              {commentBodies.map((body, index) => (
                <li>
                  <button
                    type="button"
                    class="w-full rounded border border-outline bg-surface px-3 py-2 text-left text-sm text-on-surface hover:border-outline-strong cursor-pointer"
                    x-on:click={`useCommentAt(${index})`}
                  >
                    <span class="line-clamp-3 whitespace-pre-wrap">
                      {previewComment(body)}
                    </span>
                    <span class="mt-1 block text-xs text-accent">
                      {commentBodies.length === 1
                        ? "Use as note"
                        : "Use this comment"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <TextArea
          label="Note"
          name="form.note"
          minRows={5}
          maxLength={LIST_ITEM_NOTE_MAX_LENGTH}
          validateInput="validateField('note')"
          placeholder="Why this book is on the list…"
        />
        <FormButtons
          buttonText="Save note"
          loadingText="Saving…"
          showCancelButton
        />
      </FormPost>
    </Modal>
  );
};

export default ListBookNoteModal;
