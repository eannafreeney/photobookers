import Input from "../../../components/forms/Input";

type Props = {
  isAvailable?: boolean;
  isRequired?: boolean;
};

const ValidateWebsite = ({ isAvailable, isRequired = false }: Props) => {
  const websiteAlpineAttrs = {
    "x-on:change":
      "$ajax('/auth/validate/website', { method: 'post', body: { website: form.website } })",
  };
  return (
    <div id="website_field" {...websiteAlpineAttrs}>
      <Input
        label="Website"
        name="form.website"
        type="url"
        validationTrigger="change"
        validateInput="validateWebsite()"
        isError={isAvailable === false}
        isSuccess={isAvailable === true}
        required={isRequired}
      />
      {typeof isAvailable === "boolean" && (
        <div
          class="hidden"
          x-init={`$dispatch('website-availability', { websiteIsAvailable: ${isAvailable} })`}
        />
      )}
    </div>
  );
};

export default ValidateWebsite;
