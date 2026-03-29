import { Book, BookOfTheWeek, Creator } from "../../../../../db/schema";
import DateInput from "../../../../../components/forms/DateInput";
import Button from "../../../../../components/app/Button";
import Card from "../../../../../components/app/Card";
import CardCreatorCard from "../../../../../components/app/CardCreatorCard";
import TextArea from "../../../../../components/forms/TextArea";
import FormButtons from "../../../../../components/forms/FormButtons";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox";

type BOTWBook = Book & {
  artist: Creator | null;
  publisher: Creator | null;
  bookOfTheWeekEntry?: BookOfTheWeek | null;
};

type Props = {
  formValues?: {
    weekStart: string;
    text: string;
    bookId: string;
  };
  week: string;
  options: {
    id: string;
    label: string;
    img?: string | null;
  }[];
};

const BookOfTheWeekForm = ({ formValues, options, week }: Props) => {
  const isEditMode = !!formValues;

  const alpineAttrs = {
    "x-data": `bookOfTheWeekForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value",
  };

  const action = `/dashboard/admin/planner/book-of-the-week/${isEditMode ? "update" : "create"}`;

  return (
    <form
      {...alpineAttrs}
      method="post"
      action={action}
      class="flex flex-col gap-4"
    >
      <OptionsComboBox
        options={options}
        name="form.bookId"
        label="Book"
        required
        initialSelectedId={formValues?.bookId}
      />
      {/* <TextArea
        label="Text"
        name="form.text"
        required
        maxLength={500}
        minRows={10}
      /> */}
      <input type="hidden" name="weekStart" value={week} />
      <FormButtons buttonText="Schedule" loadingText="Scheduling..." />
    </form>
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
              {book.artist && <CardCreatorCard creator={book.artist} />}
              {book.publisher && (
                <CardCreatorCard creator={book.publisher ?? null} />
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
const BOTWScheduleForm = ({
  book,
  formValues,
  isEditMode,
}: ScheduleFormProps) => {
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
          minRows={10}
        />
      </div>
      <div id="book-of-the-week-errors"></div>
      <Button variant="solid" color="primary" type="submit">
        Schedule
      </Button>
    </form>
  );
};
