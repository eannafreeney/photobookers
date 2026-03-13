import { Book } from "../../../../db/schema";

type Props = {
  book: Book;
};

const PublishToggleForm = ({ book }: Props) => {
  const bookId = book.id;
  const publicationStatus = book.publicationStatus ?? "draft";
  const isPublished = publicationStatus === "published";

  const alpineAttrs = {
    "x-data": `{ isPublished: ${isPublished} }`,
    "x-target": `publish-toggle-${bookId} preview-button-${bookId} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublished = ${isPublished}`,
    "x-target.back": `toast publish-toggle-${bookId}`,
  };

  const action = `/dashboard/books/${bookId}/${
    isPublished ? "unpublish" : "publish"
  }`;

  return (
    <form
      id={`publish-toggle-${bookId}`}
      method="post"
      action={action}
      {...alpineAttrs}
    >
      <label class="cursor-pointer">
        <input
          type="checkbox"
          class="peer sr-only"
          checked={isPublished}
          name="isPublished"
          x-on:change="$root.requestSubmit()"
          title="Publish"
        />
        <div class="relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"></div>
      </label>
    </form>
  );
};

export default PublishToggleForm;
