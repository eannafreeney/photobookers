import { Book, Creator } from "../../db/schema";
import DateInput from "../cms/ui/DateInput";
import Input from "../cms/ui/Input";
import Button from "../app/Button";
import Card from "../app/Card";
import CardCreatorCard from "../app/CardCreatorCard";
import TextArea from "../cms/ui/TextArea";

type Props = {
  book: Book & { artist: Creator; publisher: Creator };
  formValues: {
    weekStart: Date;
    text: string;
  };
  isEditMode: boolean;
};

const BookOfTheWeekForm = ({ book, formValues, isEditMode }: Props) => {
  const alpineAttrs = {
    "x-data": `bookOfTheWeekForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-target.error": "book-of-the-week-errors",
  };

  const action = isEditMode
    ? `/dashboard/admin/book-of-the-week/edit/${book.id}`
    : `/dashboard/admin/book-of-the-week/${book.id}`;

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
        action={action}
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
          <Button variant="outline" color="danger" width="full">
            Delete
          </Button>
        </form>
      )}
    </>
  );
};

export default BookOfTheWeekForm;
