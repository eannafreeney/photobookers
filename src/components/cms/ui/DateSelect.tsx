import { fadeTransition } from "../../../lib/transitions";
import InputLabel from "./InputLabel";

type DateSelectProps = {
  label: string;
  name: string;
  isDisabled?: boolean;
  required?: boolean;
  validateInput?: string;
};

const DateSelect = ({
  label,
  name,
  isDisabled = false,
  required = false,
  validateInput,
}: DateSelectProps) => {
  const inputHandler = validateInput
    ? { "x-on:input.debounce.500ms": validateInput }
    : {};

  return (
    <fieldset class="fieldset py-0">
      <InputLabel label={label} name={name} required={required} />
      <input
        type="date"
        class="input validator w-full"
        name={name.replace("form.", "")}
        x-model={name}
        disabled={isDisabled}
        required={required}
        {...inputHandler}
      />
      <span
        class="text-error text-sm min-h-[20px] mt-1 block"
        x-show={`errors.${name}`}
        x-text={`errors.${name}`}
        {...fadeTransition}
      ></span>
    </fieldset>
  );
};
export default DateSelect;
