import FormButtons from "../ui/FormButtons";
import Input from "../ui/Input";
import CountrySelect from "../ui/CountrySelect";
import TextArea from "../ui/TextArea";
import SectionTitle from "../../app/SectionTitle";
import { capitalize } from "../../../utils";

type Props = {
  formValues?: string;
  creatorId?: string;
  type?: "artist" | "publisher";
};

const CreatorForm = ({ formValues, creatorId, type = "artist" }: Props) => {
  const action = creatorId
    ? `/dashboard/creators/edit/${creatorId}`
    : "/dashboard/creators/new";

  const isEditPage = !!creatorId;

  const alpineAttrs = {
    "x-data": `creatorForm(${formValues}, ${isEditPage})`,
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:success": "onSuccess()",
    "x-on:ajax:error": "onError()",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <div class="space-y-4 ">
      <SectionTitle>{`${isEditPage ? "Edit" : "Create"} ${capitalize(
        type
      )} Profile`}</SectionTitle>
      <form action={action} method="post" {...alpineAttrs}>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <div>
            <Input
              label="Display Name"
              name="form.displayName"
              validateInput="validateDisplayName()"
              showFieldValidator
              required
            />
            <div x-html="artistSearchResults"></div>
          </div>
          <Input label="Tagline" name="form.tagline" maxLength={150} />
          <TextArea
            label="Biography"
            name="form.bio"
            validateInput="validateField('bio')"
            maxLength={1000}
            required
          />
          <Input label="City" name="form.city" maxLength={50} required />
          <CountrySelect />
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

export default CreatorForm;
