import { PropsWithChildren } from "hono/jsx";

type SwitchProps = {
  label: string;
  name: string;
  required?: boolean;
};

const Switch = ({ label, name, required }: PropsWithChildren<SwitchProps>) => {
  return (
    <fieldset class="fieldset bg-base-100 ">
      <legend class="fieldset-legend">{label}</legend>
      <label class="label">
        <input type="checkbox" x-model={name} class="toggle" />
        <span
          class="label-text"
          x-text={`${name} ? 'Published' : 'Draft'`}
        ></span>
      </label>
      {/* Hidden input that sends the actual value to the form */}
      <input
        type="hidden"
        name={name}
        x-bind:value={`${name} ? 'published' : 'draft'`}
      />
      <p class="label">{required ? "Required" : "Optional"}</p>
    </fieldset>
  );
};
export default Switch;
