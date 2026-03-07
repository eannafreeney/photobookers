import Input from "../../../components/forms/Input";

type Props = {
  isAvailable?: boolean;
};

const ValidateEmail = ({ isAvailable }: Props) => {
  const emailAlpineAttrs = {
    // "x-merge": "morph",
    "x-on:input.debounce.500ms":
      "$ajax('/auth/validate/email', { method: 'post', body: { email: form.email } })",
  };

  return (
    <div id="email_field" {...emailAlpineAttrs}>
      <Input
        type="email"
        label="Email"
        name="form.email"
        validateInput="validateEmail()"
        placeholder="you@example.com"
        isError={isAvailable === false}
        isSuccess={isAvailable === true}
        required
        autofocus
      />
      {typeof isAvailable === "boolean" && (
        <div
          class="hidden"
          x-init={`$dispatch('email-availability', { emailIsAvailable: ${isAvailable} })`}
        />
      )}
    </div>
  );
};

export default ValidateEmail;
