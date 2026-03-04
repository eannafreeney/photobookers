import { Book, BookOfTheWeek, Creator } from "../../../../../db/schema";
import DateInput from "../../../../../components/forms/DateInput";
import Button from "../../../../../components/app/Button";
import Card from "../../../../../components/app/Card";
import CardCreatorCard from "../../../../../components/app/CardCreatorCard";
import TextArea from "../../../../../components/forms/TextArea";

type BOTWBook = Book & {
  artist: Creator | null;
  publisher: Creator | null;
  bookOfTheWeekEntry?: BookOfTheWeek | null;
};

type Props = {
  book: BOTWBook;
  formValues?: {
    weekStart: string;
    text: string;
  };
};

const BookOfTheWeekForm = ({ book, formValues }: Props) => {
  const isEditMode = !!book.bookOfTheWeekEntry;

  return (
    <>
      <PreviewCard book={book} />
      <ScheduleForm
        book={book}
        formValues={formValues}
        isEditMode={isEditMode}
      />
      <DeleteForm book={book} isEditMode={isEditMode} />
    </>
  );
};

export default BookOfTheWeekForm;

type PreviewCardProps = {
  book: BOTWBook;
};

const PreviewCard = ({ book }: PreviewCardProps) => {
  return (
    <Card>
      <div class="flex items-end gap-2">
        <div class="w-1/3 shrink-0">
          <Card.Image
            src={book.coverUrl ?? ""}
            alt={book.title}
            href={`/books/${book.slug}`}
          />
        </div>
        <div class="w-2/3">
          <Card.Body>
            <div class="flex flex-col gap-2">
              <h3 class="text-balance text-md font-semibold text-on-surface-strong">
                {book.title}
              </h3>
            </div>
            <div class="flex flex-col gap-2">
              {book.artist && (
                <CardCreatorCard book={book} creatorType="artist" />
              )}
              {book.publisher && (
                <CardCreatorCard book={book} creatorType="publisher" />
              )}
            </div>
            <Card.Tags tags={book.tags ?? []} />
          </Card.Body>
        </div>
      </div>
    </Card>
  );
};

type ScheduleFormProps = {
  book: BOTWBook;
  formValues?: {
    weekStart: string;
    text: string;
  };
  isEditMode: boolean;
};
const ScheduleForm = ({ book, formValues, isEditMode }: ScheduleFormProps) => {
  const alpineAttrs = {
    "x-data": `bookOfTheWeekForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-target.error": "book-of-the-week-errors",
    "x-on:ajax:success":
      "$dispatch('dialog:close'), $dispatch('books:updated')",
  };

  const action = isEditMode
    ? `/dashboard/admin/book-of-the-week/${book.id}/update`
    : `/dashboard/admin/book-of-the-week/${book.id}/create`;

  return (
    <form
      id="book-of-the-week"
      class="mt-4"
      method="post"
      action={action}
      {...alpineAttrs}
    >
      <div>
        <DateInput label="Date" name="form.weekStart" type="week" required />
        <TextArea
          label="Text"
          name="form.text"
          required
          maxLength={500}
          minRows={4}
        />
      </div>
      <div id="book-of-the-week-errors"></div>
      <Button variant="solid" color="primary" type="submit">
        Schedule
      </Button>
    </form>
  );
};

type DeleteFormProps = {
  book: Book;
  isEditMode: boolean;
};

const DeleteForm = ({ book, isEditMode }: DeleteFormProps) => {
  if (!isEditMode) return <></>;

  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success":
      "$dispatch('dialog:close'), $dispatch('books:updated')",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <form
      id="delete-book-of-the-week"
      class="mt-4"
      method="post"
      action={`/dashboard/admin/book-of-the-week/${book.id}/delete`}
      {...alpineAttrs}
    >
      <Button variant="outline" color="danger" width="full">
        Delete
      </Button>
    </form>
  );
};
