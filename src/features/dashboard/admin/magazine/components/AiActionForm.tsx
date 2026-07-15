import Button from "@/components/app/Button";
import FormPost from "@/components/forms/FormPost";
import { loadingIcon } from "@/lib/icons";

type AiActionFormProps = {
  action: string;
  bookId: string;
  targetId: string;
  label: string;
  busyLabel: string;
};

// Runs a per-book AI action, swaps the whole card in place on success, and
// prepends a toast either way. `busy` gates the button while the request runs.
const AiActionForm = ({
  action,
  bookId,
  targetId,
  label,
  busyLabel,
}: AiActionFormProps) => {
  const alpineAttrs = {
    "x-data": "{ busy: false }",
    "x-target": `${targetId} toast`,
    "@ajax:before": "busy = true",
    "@ajax:after": "busy = false",
  };
  return (
    <FormPost action={action} {...alpineAttrs} className="w-full">
      <input type="hidden" name="bookId" value={bookId} />
      <Button
        variant="outline"
        color="primary"
        width="full"
        x-bind:disabled="busy"
      >
        <span x-show="!busy">{label}</span>
        <span
          x-show="busy"
          class="inline-flex items-center justify-center gap-1"
        >
          {busyLabel} {loadingIcon}
        </span>
      </Button>
    </FormPost>
  );
};

export default AiActionForm;
