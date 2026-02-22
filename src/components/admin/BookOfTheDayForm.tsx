import { Book, Creator } from "../../db/schema";
import DateInput from "../cms/ui/DateInput";
import Input from "../cms/ui/Input";
import Button from "../app/Button";
import Card from "../app/Card";
import CardCreatorCard from "../app/CardCreatorCard";

type Props = {
  book: Book & { artist: Creator; publisher: Creator };
};

const BookOfTheDayForm = ({ book }: Props) => {
  const alpineAttrs = {
    "x-data": "bookOfTheDayForm",
    "x-target": "true",
    "x-target.error": "book-of-the-day-errors",
    // "@ajax:success":
    //   "$dispatch('dialog:close'); $dispatch('book-of-the-day:updated');",
  };

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
        id="book-of-the-day"
        class="mt-4"
        {...alpineAttrs}
        method="post"
        action={`/dashboard/admin/book-of-the-day/${book.id}`}
      >
        <div>
          <DateInput label="Date" name="form.date" required />
          <Input
            label="Text"
            name="form.text"
            type="text"
            required
            maxLength={200}
          />
        </div>
        <div id="book-of-the-day-errors"></div>
        <Button variant="solid" color="primary" type="submit">
          Schedule
        </Button>
      </form>
    </>
  );
};
export default BookOfTheDayForm;
