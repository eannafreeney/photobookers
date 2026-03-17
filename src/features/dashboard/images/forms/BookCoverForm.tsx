import Button from "../../../../components/app/Button";
import FileUploadInput from "../../../../components/forms/FileUpload";
import SectionTitle from "../../../../components/app/SectionTitle";
import ImagePreview from "../../../../components/forms/ImagePreview";
import Card from "../../../../components/app/Card";
import BookCreators from "../../../../components/app/BookCreators";
import { formatDate } from "../../../../utils";
import { BookCardResult } from "../../../../constants/queries";

type Props = {
  initialUrl: string | null;
  book: BookCardResult;
};

const BookCoverForm = ({ initialUrl, book }: Props) => {
  const alpineAttrs = {
    "x-data": `bookCoverForm({initialUrl: ${JSON.stringify(initialUrl)}})`,
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Book Cover</SectionTitle>
      <form
        action={`/dashboard/images/books/${book.id}/cover`}
        method="post"
        enctype="multipart/form-data"
        {...alpineAttrs}
      >
        <div class="space-y-4">
          <div class="flex items-center gap-4 justify-evenly">
            <ImagePreview />
            {book && <CardPreview book={book} />}
          </div>
          <FileUploadInput
            label="Add Book Cover"
            name="cover"
            required
            x-on:change="onFileChange"
            x-ref="fileInput"
          />

          <p x-show="error" class="text-sm text-red-600" x-text="error"></p>
          <div class="flex gap-2">
            <Button
              variant="solid"
              color="primary"
              x-bind:disabled="isSubmitting || previewUrl === initialUrl || isCompressing"
            >
              <span x-show="!isSubmitting">Save</span>
              <span x-show="isSubmitting">Saving…</span>
            </Button>
            <Button
              variant="solid"
              color="inverse"
              x-on:click="cancelSelection"
              x-bind:disabled="isSubmitting || previewUrl === initialUrl || isCompressing"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookCoverForm;

const CardPreview = ({ book }: { book: BookCardResult }) => (
  <div class="mb-4">
    <p class="text-sm text-on-surface-variant mb-2">Book Card Preview</p>
    <Card className="max-w-[280px]">
      <div class="px-2 py-2 flex items-center justify-between">
        <BookCreators book={book} showPublisherInsteadOfArtist={false} />
        <Card.Text>
          {book.releaseDate && formatDate(book.releaseDate)}
        </Card.Text>
      </div>
      <figure
        class="relative w-full overflow-hidden bg-white shadow-sm aspect-4/3"
        style="height: 300px"
      >
        <img
          x-bind:src="previewUrl || initialUrl || ''"
          x-bind:alt="''"
          class="w-full h-full object-cover object-center"
        />
      </figure>
      <Card.Body>
        <Card.Title>{book.title}</Card.Title>
      </Card.Body>
    </Card>
  </div>
);
