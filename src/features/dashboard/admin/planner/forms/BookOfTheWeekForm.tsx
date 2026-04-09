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

  return (
    <form
      {...alpineAttrs}
      method="post"
      action={`/dashboard/admin/planner/book-of-the-week/${week}/create`}
      class="flex flex-col gap-4"
    >
      <OptionsComboBox
        options={options}
        name="form.bookId"
        label="Book"
        required
        initialSelectedId={formValues?.bookId}
      />
      <input type="hidden" name="weekStart" value={week} />
      <FormButtons buttonText="Schedule" loadingText="Scheduling..." />
    </form>
  );
};

export default BookOfTheWeekForm;
