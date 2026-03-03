import { Book, BookOfTheWeek, Creator } from "../../../../../db/schema";
import DateInput from "../../../../../components/forms/DateInput";
import Button from "../../../../../components/app/Button";
import Card from "../../../../../components/app/Card";
import CardCreatorCard from "../../../../../components/app/CardCreatorCard";
import TextArea from "../../../../../components/forms/TextArea";

type Props = {
  book: Book & {
    artist: Creator | null;
    publisher: Creator | null;
    bookOfTheWeekEntry?: BookOfTheWeek | null;
  };
  formValues?: {
    weekStart: string;
    text: string;
  };
};

const BookOfTheWeekForm = ({ book, formValues }: Props) => {
  const isEditMode = !!book.bookOfTheWeekEntry;

  const alpineAttrs = {
    "x-data": `bookOfTheWeekForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-target.error": "book-of-the-week-errors",
  };

  const method = isEditMode ? "PATCH" : "POST";

  return (
    <>
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
      <form
        id="book-of-the-week"
        class="mt-4"
        method="post"
        action={`/dashboard/admin/book-of-the-week/${book.id}`}
        {...alpineAttrs}
      >
        <div>
          <DateInput label="Date" name="form.weekStart" type="week" required />
          <TextArea
            label="Text"
            name="form.text"
            required
            maxLength={250}
            minRows={4}
          />
          <input type="hidden" name="_method" value={method} />
        </div>
        <div id="book-of-the-week-errors"></div>
        <Button variant="solid" color="primary" type="submit">
          Schedule
        </Button>
      </form>
      {isEditMode && (
        <form
          class="mt-4"
          method="post"
          x-target="toast"
          action={`/dashboard/admin/book-of-the-week/delete/${book.id}`}
        >
          <input type="hidden" name="_method" value="DELETE" />
          <Button variant="outline" color="danger" width="full">
            Delete
          </Button>
        </form>
      )}
    </>
  );
};

export default BookOfTheWeekForm;
