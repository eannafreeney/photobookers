import { fadeTransition } from "../../lib/transitions";
import InputLabel from "./InputLabel";

type CheckboxProps = {
  label: string;
  name: string;
  required?: boolean;
  "x-model"?: string;
};

export const Checkbox = ({ label, name, required = false }: CheckboxProps) => {
  return (
    <fieldset class="grid gap-1.5 text-xs grid-cols-1 auto-rows-max">
      {/* <InputLabel label={label} name="" required={required} /> */}
      <label
        for={name}
        class="flex items-center gap-2 text-sm font-medium text-on-surface dark:text-on-surface-dark has-checked:text-on-surface-strong dark:has-checked:text-on-surface-dark-strong has-disabled:cursor-not-allowed has-disabled:opacity-75"
      >
        <span class="relative flex items-center">
          <input
            id={name}
            type="checkbox"
            class="before:content[''] peer cursor-pointer relative size-4 appearance-none overflow-hidden rounded-sm border border-outline bg-surface-alt before:absolute before:inset-0 checked:border-primary checked:before:bg-primary focus:outline-2 focus:outline-offset-2 focus:outline-outline-strong checked:focus:outline-primary active:outline-offset-0 disabled:cursor-not-allowed"
            name={name.replace("form.", "")}
            x-model={name}
            required={required}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            stroke="currentColor"
            fill="none"
            stroke-width="4"
            class="pointer-events-none invisible absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-on-primary peer-checked:visible"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </span>
        <span>{label}</span>
      </label>
      <InputError name={name} />
    </fieldset>
  );
};

export default Checkbox;

const InputError = ({ name }: { name: string }) => (
  <div class="text-xs min-h-[16px] my-2 block">
    <span
      class="text-danger block text-left"
      x-show={`errors.${name}`}
      x-text={`errors.${name}`}
      {...fadeTransition}
    />
  </div>
);
