import FormButton from "../ui/FormButton";
import Input from "../ui/Input";
import CountrySelect from "../ui/CountrySelect";
import TextArea from "../ui/TextArea";
import Form from "../../app/Form";
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

  return (
    <div class="space-y-4 ">
      <SectionTitle>{`${isEditPage ? "Edit" : "Create"} ${capitalize(
        type
      )} Profile`}</SectionTitle>
      <Form
        x-data={`creatorForm(${formValues}, ${isEditPage})`}
        action={action}
      >
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
          <TextArea
            label="Biography"
            name="form.bio"
            validateInput="validateField('bio')"
            maxLength={200}
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
        <FormButton
          buttonText={isEditPage ? "Update" : "Create"}
          loadingText={isEditPage ? "Updating..." : "Creating..."}
        />
      </Form>
    </div>
  );
};

export default CreatorForm;
