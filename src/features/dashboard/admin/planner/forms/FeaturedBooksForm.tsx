import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import FormButtons from "../../../../../components/forms/FormButtons";

type Props = {
  week: string;
  formValues?: {
    bookId1: string;
    bookId2: string;
    bookId3: string;
    bookId4: string;
    bookId5: string;
  };
  options: {
    id: string;
    label: string;
    img: string | null;
  }[];
};

const FeaturedBooksForm = ({ week, formValues, options }: Props) => {
  const isEditMode = !!formValues;

  const alpineAttrs = {
    "x-data": `featuredForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value",
  };

  return (
    <form
      {...alpineAttrs}
      action={`/dashboard/admin/planner/featured/${week}/create`}
      method="post"
      class="flex flex-col gap-4"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <OptionsComboBox
            options={options}
            name={`form.bookId${i}`}
            label={`Book ${i}`}
            required
            initialSelectedId={
              formValues?.[`bookId${i}` as keyof typeof formValues]
            }
          />
        </div>
      ))}
      <input type="hidden" name="weekStart" value={week} />
      <FormButtons
        buttonText={isEditMode ? "Update" : "Schedule"}
        loadingText={isEditMode ? "Updating..." : "Scheduling..."}
        showCancelButton
      />
    </form>
  );
};
export default FeaturedBooksForm;
