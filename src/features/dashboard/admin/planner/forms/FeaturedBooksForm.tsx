import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import Button from "../../../../../components/app/Button";
import { FeaturedBookOfTheWeekWithBook } from "../services";
import FormButtons from "../../../../../components/forms/FormButtons";

type Props = {
  week: string;
  featuredBooks?: FeaturedBookOfTheWeekWithBook[];
  options: {
    id: string;
    label: string;
    img: string | null;
    description?: string | null;
  }[];
  isEditMode?: boolean;
};

const FeaturedBooksForm = ({
  featuredBooks,
  week,
  options,
  isEditMode = false,
}: Props) => {
  const initialFormValues = {
    weekStart: week,
    bookId1: featuredBooks?.[0]?.book?.id ?? "",
    bookId2: featuredBooks?.[1]?.book?.id ?? "",
    bookId3: featuredBooks?.[2]?.book?.id ?? "",
    bookId4: featuredBooks?.[3]?.book?.id ?? "",
    bookId5: featuredBooks?.[4]?.book?.id ?? "",
  };

  const alpineAttrs = {
    "x-data": `featuredForm(${JSON.stringify(initialFormValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value",
  };

  const action = isEditMode ? "update" : "create";

  return (
    <form
      {...alpineAttrs}
      action={`/dashboard/admin/planner/featured/${action}`}
      method="post"
      class="flex flex-col gap-4"
    >
      <input type="hidden" name="weekStart" value={week} />
      {featuredBooks ??
        [1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <OptionsComboBox
              options={options}
              name={`form.bookId${i}`}
              label={`Book ${i}`}
              required
            />
          </div>
        ))}
      <FormButtons />
      {/* <Button color="primary" variant="solid" type="submit">
        {isEditMode ? "Update featured books" : "Save featured books"}
      </Button> */}
    </form>
  );
};
export default FeaturedBooksForm;
