import InputLabel from "./InputLabel";

type InputProps = {
  label: string;
  name: string;
  isChecked: boolean;
  isDisabled?: boolean;
  disabledBinding?: string;
};

const ToggleInput = ({
  label,
  name,
  isChecked,
  isDisabled,
  disabledBinding,
}: InputProps) => {
  return (
    <fieldset class="grid gap-1.5 py-1 text-xs grid-cols-1 auto-rows-max">
      <InputLabel label={label} name={name} />
      <label class="cursor-pointer">
        <input
          type="checkbox"
          class="peer sr-only"
          checked={isChecked}
          name={name.replace("form.", "")}
          x-model={name}
          title={label}
          {...(isDisabled !== undefined ? { disabled: isDisabled } : {})}
          {...(disabledBinding ? { "x-bind:disabled": disabledBinding } : {})}
        />
        <div class="relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"></div>
      </label>
    </fieldset>
  );
};

export default ToggleInput;
