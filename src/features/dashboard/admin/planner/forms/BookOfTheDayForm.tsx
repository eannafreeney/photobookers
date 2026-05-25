import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import FormButtons from "../../../../../components/forms/FormButtons";

type Props = {
  formValues?: {
    date: string;
    bookId: string;
  };
  date: string;
  options: {
    id: string;
    label: string;
    img?: string | null;
  }[];
};

const BookOfTheDayForm = ({ formValues, options, date }: Props) => {
  const isEditMode = !!formValues;

  const alpineAttrs = {
    "x-data": `bookOfTheDayForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value",
  };

  return (
    <form
      {...alpineAttrs}
      method="post"
      action={`/dashboard/admin/planner/book-of-the-day/${date}/create`}
      class="flex flex-col gap-4"
    >
      <OptionsComboBox
        options={options}
        name="form.bookId"
        label="Book"
        required
        initialSelectedId={formValues?.bookId}
      />
      <input type="hidden" name="date" value={date} />
      <FormButtons buttonText="Schedule" loadingText="Scheduling..." />
    </form>
  );
};

export default BookOfTheDayForm;
