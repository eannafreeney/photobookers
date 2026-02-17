import InputLabel from "./InputLabel";
import { fadeTransition } from "../../../lib/transitions";
import { getInputIcon } from "../../../utils";

type InputProps = {
  label: string;
  name: string;
  required?: boolean;
  validateInput?: string;
};

const DateInput = ({
  label,
  name,
  validateInput,
  required = false,
}: InputProps) => {
  return (
    <fieldset class="grid gap-1.5 text-xs grid-cols-1 auto-rows-max">
      <InputLabel label={label} name={name} required={required} />
      <label class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
        {getInputIcon("date")}
        <input
          id={name}
          type="date"
          class="w-full bg-surface-alt px-2 py-2 text-base md:text-sm font-normal cursor-pointer focus:outline-none"
          name={name.replace("form.", "")}
          required={required}
          x-model={name}
          autocomplete="off"
          {...{ "x-on:blur": `${name} = ${name}.trim()` }}
          {...{ "x-on:input.debounce.500ms": validateInput }}
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

export default DateInput;
