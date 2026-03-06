import FormButtons from "../../../../components/forms/FormButtons";
import Input from "../../../../components/forms/Input";
import CountrySelect from "../../../../components/forms/CountrySelect";
import TextArea from "../../../../components/forms/TextArea";
import SectionTitle from "../../../../components/app/SectionTitle";
import { capitalize } from "../../../../utils";
import ValidateDisplayName from "../../../auth/components/ValidateDisplayName";

type Props = {
  formValues?: string;
  creatorId?: string;
  type?: "artist" | "publisher";
};

const EditCreatorForm = ({ formValues, creatorId, type = "artist" }: Props) => {
  const isEditPage = !!creatorId;

  const alpineAttrs = {
    "x-data": `editCreatorForm(${formValues}, ${isEditPage})`,
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <div class="space-y-4 ">
      <SectionTitle>{`${isEditPage ? "Edit" : "Create"} ${capitalize(
        type,
      )} Profile`}</SectionTitle>
      <form
        action={`/dashboard/creators/${creatorId}/update`}
        method="post"
        {...alpineAttrs}
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <Input
            label="Display Name"
            name="form.displayName"
            validateInput="validateField('displayName')"
            maxLength={100}
            required
          />
          <Input label="Tagline" name="form.tagline" maxLength={150} />
          <TextArea
            label="Biography"
            name="form.bio"
            validateInput="validateField('bio')"
            maxLength={1000}
            required
          />
          <Input label="City" name="form.city" maxLength={50} required />
          <CountrySelect isRequired />
          <Input
            label="Website"
            name="form.website"
            type="url"
            placeholder="https://..."
          />
          <Input
            label="Facebook"
            name="form.facebook"
            type="url"
            placeholder="https://..."
          />
          <Input
            label="Twitter"
            name="form.twitter"
            placeholder="https://..."
            type="url"
          />
          <Input
            label="Instagram"
            name="form.instagram"
            type="url"
            placeholder="https://..."
          />
          <input
            type="hidden"
            name="type"
            value={type}
            x-init={`form.type = '${type}'`}
          />
        </div>
        <FormButtons />
      </form>
    </div>
  );
};

export default EditCreatorForm;
