import Input from "../../../components/cms/ui/Input";

type Props = {
  isAvailable?: boolean;
};

const ValidateWebsite = ({ isAvailable }: Props) => {
  const websiteAlpineAttrs = {
    "x-on:input.debounce.500ms":
      "$ajax('/auth/validate-website', { method: 'post', body: { website: form.website } })",
  };
  return (
    <div id="website_field" {...websiteAlpineAttrs}>
      <Input
        label="Website"
        name="form.website"
        type="url"
        validateInput="validateWebsite()"
        isError={isAvailable === false}
        isSuccess={isAvailable === true}
        required
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
