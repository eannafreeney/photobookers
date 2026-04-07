import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import FormButtons from "../../../../../components/forms/FormButtons";
import FormPost from "../../../../../components/forms/FormPost";
import TextArea from "../../../../../components/forms/TextArea";

type Props = {
  formValues?: {
    weekStart: string;
    creatorId: string;
  };
  options: {
    id: string;
    label: string;
    img?: string | null;
  }[];
  week: string;
};

const AOTWForm = ({ options, week }: Props) => {
  const alpineAttrs = {
    "x-data": `aotwForm`,
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value",
  };

  const action = `/dashboard/admin/planner/artist-of-the-week/${week}/create`;

  return (
    <FormPost {...alpineAttrs} action={action} className="flex flex-col gap-4">
      <OptionsComboBox
        options={options}
        name="form.creatorId"
        label="Artist"
        required
      />
      <input type="hidden" name="weekStart" value={week} />
      <FormButtons
        buttonText="Schedule"
        loadingText="Scheduling..."
        showCancelButton
      />
    </FormPost>
  );
};

export default AOTWForm;
