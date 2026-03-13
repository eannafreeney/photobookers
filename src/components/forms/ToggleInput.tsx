import InputLabel from "./InputLabel";
import { fadeTransition } from "../../lib/transitions";
import { getInputIcon } from "../../utils";
import ToggleButton from "./ToggleButton";

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
      <ToggleButton
        isChecked={isChecked}
        name={name}
        isDisabled={isDisabled}
        disabledBinding={disabledBinding}
      />
    </fieldset>
  );
};

export default ToggleInput;
