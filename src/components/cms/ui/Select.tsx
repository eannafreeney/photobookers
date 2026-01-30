import { fadeTransition } from "../../../lib/transitions";
import InputLabel from "./InputLabel";

type SelectProps = {
  label: string;
  placeholder: string;
  options: any[];
  required?: boolean;
  name: string;
};

const Select = ({
  label,
  placeholder,
  options,
  required = false,
  name,
}: SelectProps) => {
  return (
    <fieldset class="fieldset ">
      <InputLabel label={label} name={name} required={required} />
      <select
        class="select w-full"
        name={name.replace("form.", "")}
        x-model={name}
      >
        <option disabled selected value="">
          {placeholder}
        </option>
        {options.map((option: any) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
      <p
        class="text-error text-sm mt-1"
        x-show={`errors.${name}`}
        x-text={`errors.${name}`}
        {...fadeTransition}
      />
    </fieldset>
  );
};
export default Select;
