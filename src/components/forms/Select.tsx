import { fadeTransition } from "../../lib/transitions";
import InputLabel from "./InputLabel";

type SelectProps = {
  label: string;
  options: any[];
  required?: boolean;
  name: string;
};

const Select = ({ label, options, required = false, name }: SelectProps) => {
  return (
    <div class="relative flex w-full max-w-xs flex-col gap-0 text-on-surface dark:text-on-surface-dark">
      <InputLabel label={label} name={name} required={required} />
      {chevronIcon}
      <select
        id={name}
        name={name.replace("form.", "")}
        x-model={name}
        class="w-full appearance-none rounded-radius border border-outline bg-surface-alt px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-75"
      >
        <option value="">Select...</option>
        {options.map((option: any) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
      <p
        class="text-error text-sm mt-1"
        x-show={`errors && errors.${name}`}
        x-text={`errors && errors.${name}`}
        {...fadeTransition}
      />
    </div>
  );
};

export default Select;

const chevronIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="absolute pointer-events-none right-4 top-11 size-5"
  >
    <path
      fill-rule="evenodd"
      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
      clip-rule="evenodd"
    />
  </svg>
);
