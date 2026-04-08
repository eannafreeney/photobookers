import { capitalize } from "../../../../../utils";

type Props = {
  isSent: boolean;
  recipientType: "artist" | "publisher";
};

const ToggleButton = ({ isSent, recipientType }: Props) => (
  <label class="cursor-pointer inline-flex items-center gap-2">
    <input
      type="checkbox"
      class="peer sr-only"
      checked={isSent}
      disabled={isSent}
      title={`Email ${capitalize(recipientType)}`}
      x-on:change="$el.form?.requestSubmit()"
    />
    <div class="relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-success peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"></div>
    <span class="text-xs text-on-surface-strong">
      {`Email ${capitalize(recipientType)}`}
    </span>
  </label>
);

export default ToggleButton;
