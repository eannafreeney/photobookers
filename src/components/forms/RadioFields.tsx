import InputLabel from "./InputLabel";

type RadioFieldsProps = {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  validateInput?: string;
  required?: boolean;
};

const RadioFields = ({
  label,
  name,
  options,
  required,
  validateInput,
}: RadioFieldsProps) => (
  <fieldset class="flex flex-col gap-2">
    <InputLabel label={label} name={name} required={required} />
    <div class="flex flex-wrap gap-4">
      {options.map(({ value, label }) => (
        <div class="flex items-center justify-start gap-2 font-medium text-on-surface has-disabled:opacity-75 dark:text-on-surface-dark">
          <input
            id={`${name}-${value}`}
            type="radio"
            class="before:content[''] relative h-4 w-4 appearance-none cursor-pointer rounded-full border border-outline bg-surface-alt before:invisible before:absolute before:left-1/2 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-on-primary checked:border-primary checked:bg-primary checked:before:visible focus:outline-2 focus:outline-offset-2 focus:outline-outline-strong checked:focus:outline-primary disabled:cursor-not-allowed"
            name={name.replace("form.", "")}
            value={value}
            x-model={name}
            {...{ "x-on:input.debounce.500ms": validateInput }}
          />
          <label for={`${name}-${value}`} class="text-sm">
            {label}
          </label>
        </div>
      ))}
    </div>
  </fieldset>
);

export default RadioFields;
