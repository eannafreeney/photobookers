import Input from "../../../components/forms/Input";

type Props = {
  isAvailable?: boolean;
};

const ValidateEmail = ({ isAvailable }: Props) => {
  const emailAlpineAttrs = {
    // "x-merge": "morph",
    "x-on:change":
      "$ajax('/auth/validate/email', { method: 'post', body: { email: form.email } })",
  };

  return (
    <div id="email_field" {...emailAlpineAttrs}>
      <Input
        label="Email!!"
        name="form.email"
        type="email"
        placeholder="you@example.com"
        validateInput="validateEmail()"
        required
        isError={isAvailable === false}
        isSuccess={isAvailable === true}
      />
      {/* <label for="form.email">Email!!!!</label>
      {isAvailable === false && (
        <div id="email_error" style="color:#cc0000">
          The email is already taken.
        </div>
      )}

      <input
        type="email"
        name="form.email"
        id="form.email"
        x-model="form.email"
        class="w-full bg-surface-alt rounded-radius border border-outline px-2 py-2 text-base md:text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary"
      /> */}
      {/* <fieldset class="grid gap-1.5 text-xs grid-cols-1 auto-rows-max">
        <InputLabel label="Email!!" name="form.email" required />
        <label class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
          {getInputIcon("email")}
          <input
            id="form.email"
            type="email"
            class="w-full bg-surface-alt px-2 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 "
            name="email"
            placeholder="you@example.com"
            x-model="form.email"
            autocomplete="off"
            required
            x-autofocus
          />
        </label>
        <div class="text-xs min-h-[16px] my-2 block">
          {isAvailable === false ? (
            <span class="text-danger block text-right" {...fadeTransition}>
              ✗ Taken
            </span>
          ) : isAvailable === true ? (
            <span class="text-success block text-right" {...fadeTransition}>
              ✓ Available
            </span>
          ) : (
            <span
              class="text-danger block text-left"
              x-show={`errors.form.email`}
              x-text={`errors.form.email`}
              {...fadeTransition}
            />
          )}
        </div>
      </fieldset> */}
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
