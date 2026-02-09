import { fadeTransition } from "../../../lib/transitions";
import InputLabel from "./InputLabel";

type TextAreaProps = {
  label: string;
  minRows?: number;
  placeholder?: string;
  required?: boolean;
  name: string;
  maxLength?: number;
  validateInput?: string;
};

const TextArea = ({
  label,
  minRows = 10,
  placeholder,
  maxLength,
  required,
  name,
  validateInput,
}: TextAreaProps) => {
  const inputHandler = validateInput
    ? { "x-on:input.debounce.500ms": validateInput }
    : {};

  return (
    <fieldset class="grid gap-1.5 text-xs grid-cols-1 auto-rows-max">
      <InputLabel
        label={label}
        maxLength={maxLength}
        name={name}
        required={required}
      />
      <label
        class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary
"
      >
        <textarea
          class="w-full bg-surface-alt px-2.5 py-2 text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
          name={name.replace("form.", "")}
          placeholder={placeholder}
          rows={minRows}
          required={required}
          x-model={name}
          {...inputHandler}
        />
      </label>
      <div class="text-error text-sm min-h-[20px] mt-1 block">
        <span
          x-show={`errors.${name}`}
          x-text={`errors.${name}`}
          {...fadeTransition}
        ></span>
      </div>
    </fieldset>
  );
};

export default TextArea;
