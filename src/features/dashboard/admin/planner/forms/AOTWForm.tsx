import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import FormButtons from "../../../../../components/forms/FormButtons";
import TextArea from "../../../../../components/forms/TextArea";

type Props = {
  formValues?: {
    weekStart: string;
    creatorId: string;
    text: string;
  };
  options: {
    id: string;
    label: string;
    img?: string | null;
  }[];
  week: string;
};

const AOTWForm = ({ formValues, options, week }: Props) => {
  const isEditMode = !!formValues;

  const alpineAttrs = {
    "x-data": `aotwForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value",
  };

  const action = `/dashboard/admin/planner/artist-of-the-week/${isEditMode ? "update" : "create"}`;

  return (
    <form
      {...alpineAttrs}
      action={action}
      method="post"
      class="flex flex-col gap-4"
    >
      <OptionsComboBox
        options={options}
        name="form.creatorId"
        label="Artist"
        required
        initialSelectedId={formValues?.creatorId}
      />
      {/* <TextArea
        label="Text"
        name="form.text"
        validateInput="validateField('text')"
        minRows={8}
        maxLength={400}
      /> */}
      <input type="hidden" name="weekStart" value={week} />
      <FormButtons
        buttonText={isEditMode ? "Update" : "Schedule"}
        loadingText={isEditMode ? "Updating..." : "Scheduling..."}
        showCancelButton
      />
    </form>
  );
};

export default AOTWForm;
