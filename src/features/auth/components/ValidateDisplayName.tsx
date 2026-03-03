import Input from "../../../components/forms/Input";

type Props = {
  isAvailable?: boolean;
};

const ValidateDisplayName = ({ isAvailable }: Props) => {
  const displayNameAlpineAttrs = {
    "x-on:input.debounce.500ms":
      "$ajax('/auth/validate-displayName', { method: 'post', body: { displayName: form.displayName } })",
  };

  return (
    <div id="displayName_field" {...displayNameAlpineAttrs}>
      <Input
        type="text"
        label="Display Name"
        name="form.displayName"
        validateInput="validateDisplayName()"
        isError={isAvailable === false}
        isSuccess={isAvailable === true}
        required
      />
      {typeof isAvailable === "boolean" && (
        <div
          class="hidden"
          x-init={`$dispatch('displayName-availability', { displayNameIsAvailable: ${isAvailable} })`}
        />
      )}
    </div>
  );
};

export default ValidateDisplayName;
