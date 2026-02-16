import InputLabel from "./InputLabel";
import { fadeTransition } from "../../../lib/transitions";
import { getInputIcon } from "../../../utils";

type InputProps = {
  label: string;
  type?: "text" | "number" | "email" | "password" | "url" | "date";
  placeholder?: string;
  required?: boolean;
  name: string;
  maxLength?: number;
  validateInput?: string;
  showEmailAvailabilityChecker?: boolean;
  showDisplayNameAvailabilityChecker?: boolean;
  showWebsiteAvailabilityStatus?: boolean;
  isDisabled?: boolean;
  readOnly?: boolean;
};

const Input = ({
  label,
  type = "text",
  placeholder = "",
  required = false,
  name,
  maxLength,
  validateInput,
  showEmailAvailabilityChecker = false,
  showDisplayNameAvailabilityChecker = false,
  showWebsiteAvailabilityStatus = false,
  isDisabled = false,
  readOnly = false,
  ...restProps
}: InputProps) => {
  const inputHandler = {
    "x-on:input.debounce.500ms": validateInput,
  };

  return (
    <fieldset class="grid gap-1.5 text-xs grid-cols-1 auto-rows-max">
      <InputLabel
        label={label}
        maxLength={maxLength}
        name={name}
        required={required}
        showEmailAvailabilityChecker={showEmailAvailabilityChecker}
        showDisplayNameAvailabilityChecker={showDisplayNameAvailabilityChecker}
        showWebsiteAvailabilityStatus={showWebsiteAvailabilityStatus}
      />
      <label class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
        {getInputIcon(type)}
        <input
          id={name}
          type={type}
          class="w-full bg-surface-alt px-2 py-2 text-md md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 "
          name={name.replace("form.", "")}
          placeholder={placeholder ?? label}
          required={required}
          disabled={isDisabled}
          x-model={name}
          maxLength={maxLength}
          autocomplete="off"
          {...{ "x-on:blur": `${name} = ${name}.trim()` }}
          {...(readOnly && { readOnly: true })}
          {...(validateInput && inputHandler)}
          {...restProps}
        />
      </label>
      <div class="text-sm min-h-[20px] mt-1 block">
        <span
          class="text-danger"
          x-show={`errors.${name}`}
          x-text={`errors.${name}`}
          {...fadeTransition}
        ></span>
      </div>
    </fieldset>
  );
};

export default Input;
