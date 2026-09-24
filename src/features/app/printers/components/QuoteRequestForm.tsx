import Button from "../../../../components/app/Button";
import type { Printer } from "../../../../db/schema";

const fieldClass =
  "w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface";

const QuoteRequestForm = ({
  printers,
  preselectedSlug,
}: {
  printers: Printer[];
  preselectedSlug?: string;
}) => {
  return (
    <form
      method="post"
      action="/printers/request"
      class="mx-auto flex w-full max-w-xl flex-col gap-4"
      x-data
      x-on:change={`
        const boxes = $el.querySelectorAll('input[name=printerIds]');
        const checked = [...boxes].filter((box) => box.checked);
        if (checked.length > 3 && $event.target.checked) $event.target.checked = false;
      `}
    >
      <fieldset class="flex flex-col gap-2">
        <legend class="text-sm font-medium text-on-surface-strong">
          Printers (up to 3)
        </legend>
        {printers.map((printer) => (
          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="printerIds"
              value={printer.id}
              checked={printer.slug === preselectedSlug ? true : undefined}
            />
            {printer.name}
            <span class="text-on-surface-weak">
              {printer.city}, {printer.country}
            </span>
          </label>
        ))}
      </fieldset>
      <label class="flex flex-col gap-1 text-sm">
        Copies
        <input class={fieldClass} name="copies" type="number" min="1" required />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Pages
        <input class={fieldClass} name="pageCount" type="number" min="1" required />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Trim size
        <input class={fieldClass} name="trimSize" required placeholder="20 × 25 cm" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Binding
        <input class={fieldClass} name="binding" required placeholder="Hardcover, Swiss bind…" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Deadline
        <input class={fieldClass} name="deadline" required placeholder="March 2027" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Ship to
        <input class={fieldClass} name="shipToCountry" required />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Books it should feel like
        <textarea class={fieldClass} name="referenceBooks" rows={3} />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Anything else
        <textarea class={fieldClass} name="message" rows={3} />
      </label>
      <Button variant="solid" color="primary" width="fit">
        Send brief
      </Button>
    </form>
  );
};

export default QuoteRequestForm;
