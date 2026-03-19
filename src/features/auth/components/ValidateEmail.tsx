import Input from "../../../components/forms/Input";

type Props = {
  isAvailable?: boolean;
};

const ValidateEmail = ({ isAvailable }: Props) => {
  const emailAlpineAttrs = {
    "x-on:change":
      "$ajax('/auth/validate/email', { method: 'post', body: { email: form.email } })",
  };

  return (
    <div id="email_field" {...emailAlpineAttrs}>
      <Input
        label="Email"
        name="form.email"
        type="email"
        placeholder="you@example.com"
        validateInput="validateEmail()"
        required
        isError={isAvailable === false}
        isSuccess={isAvailable === true}
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
