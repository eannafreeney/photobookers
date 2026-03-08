import InputLabel from "./InputLabel";
import { fadeTransition } from "../../lib/transitions";
import { getInputIcon } from "../../utils";

type InputProps = {
  label: string;
  type?: "text" | "number" | "email" | "password" | "url" | "date";
  placeholder?: string;
  required?: boolean;
  name: string;
  maxLength?: number;
  validateInput?: string;
  validationTrigger?: "blur" | "input" | "change";
  isDisabled?: boolean;
  readOnly?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  autofocus?: boolean;
};

const Input = ({
  label,
  type = "text",
  placeholder = "",
  required = false,
  name,
  maxLength,
  validateInput,
  validationTrigger = "input",
  isDisabled = false,
  readOnly = false,
  isError = false,
  isSuccess = false,
  autofocus = false,
  ...restProps
}: InputProps) => {
  const eventByTrigger = {
    input: "x-on:input.debounce.500ms",
    blur: "x-on:blur",
    change: "x-on:change",
  } as const;

  const inputValidator = validateInput
    ? { [eventByTrigger[validationTrigger]]: validateInput }
    : {};

  return (
    <fieldset class="grid gap-1.5 text-xs grid-cols-1 auto-rows-max">
      <InputLabel
        label={label}
        maxLength={maxLength}
        name={name}
        required={required}
      />
      <label class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
        {getInputIcon(type)}
        <input
          id={name}
          type={type}
          class="w-full bg-surface-alt px-2 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 "
          name={name.replace("form.", "")}
          placeholder={placeholder ?? label}
          required={required}
          disabled={isDisabled}
          x-model={name}
          maxLength={maxLength}
          autocomplete="off"
          {...{
            "x-on:blur": `${name} = ${name}.trim()`,
          }}
          {...(readOnly && { readOnly: true })}
          {...(validateInput && inputValidator)}
          {...restProps}
        />
      </label>
      <InputError isError={isError} isSuccess={isSuccess} name={name} />
    </fieldset>
  );
};

export default Input;

type InputErrorProps = {
  isError?: boolean;
  isSuccess?: boolean;
  name: string;
};

const InputError = ({ isError, isSuccess, name }: InputErrorProps) => (
  <div class="text-xs min-h-[16px] my-2 block">
    {isError ? (
      <span class="text-danger block text-right" {...fadeTransition}>
        ✗ Taken
      </span>
    ) : isSuccess ? (
      <span class="text-success block text-right" {...fadeTransition}>
        ✓ Available
      </span>
    ) : (
      <span
        class="text-danger block text-left"
        x-show={`errors.${name}`}
        x-text={`errors.${name}`}
        {...fadeTransition}
      />
    )}
  </div>
);
