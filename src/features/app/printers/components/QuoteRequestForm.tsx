import Button from "../../../../components/app/Button";
import type { Printer } from "../../../../db/schema";

const fieldClass =
  "w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface";

type Props = {
  printers: Printer[];
  preselectedSlug?: string;
  modal?: boolean;
  allowTest?: boolean;
};

const QuoteRequestForm = ({
  printers,
  preselectedSlug,
  modal = false,
}: Props) => {
  const options = printers.map((printer) => ({
    id: printer.id,
    name: printer.name,
    city: printer.city,
    country: printer.country,
  }));
  const preselectedId =
    printers.find((printer) => printer.slug === preselectedSlug)?.id ?? null;

  return (
    <form
      method="post"
      action="/printers/request"
      class="flex w-full flex-col gap-4"
      x-data={`quoteRequestForm(${JSON.stringify(options)}, ${JSON.stringify(preselectedId)})`}
      {...(modal
        ? { "x-target": "modal-root", "x-target.error": "toast" }
        : {})}
    >
      {modal ? <input type="hidden" name="modal" value="1" /> : null}
      <div class="grid items-start gap-6 md:h-[70vh] md:grid-cols-2 md:items-stretch">
        <div class="flex flex-col gap-4 md:overflow-y-auto md:pr-2">
          <label class="flex flex-col gap-1 text-sm">
            Project name
            <input
              class={fieldClass}
              name="projectName"
              required
              maxlength={200}
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Details
            <textarea
              class={fieldClass}
              name="details"
              rows={4}
              required
              maxlength={4000}
              placeholder="Copies, pages, size, binding, deadline…"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Ships to
            <input
              class={fieldClass}
              name="shipToCountry"
              required
              maxlength={120}
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Note
            <textarea
              class={fieldClass}
              name="note"
              rows={2}
              maxlength={2000}
            />
          </label>
          <div class="flex flex-col gap-1 text-sm">
            <p class="text-on-surface-weak">
              Send to <span x-text="selectedIds.length"></span> of 3
            </p>
            <ul class="flex flex-col gap-1">
              <template
                x-for="printer in selectedPrinters()"
                x-bind:key="printer.id"
              >
                <li class="text-on-surface-strong" x-text="printer.name"></li>
              </template>
            </ul>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button variant="solid" color="primary" width="fit">
              Send Request
            </Button>
          </div>
        </div>
        <div class="flex flex-col gap-3 md:min-h-0">
          <p class="text-sm text-on-surface-weak">
            <span x-text="selectedIds.length"></span> of 3 selected
          </p>
          <div class="flex flex-col gap-2 md:min-h-0 md:flex-1 md:overflow-y-auto">
            {options.map((printer) => (
              <label class="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  class="mt-1 cursor-pointer"
                  name="printerIds"
                  value={printer.id}
                  x-model="selectedIds"
                  {...{
                    "x-bind:disabled": `selectedIds.length >= 3 && !selectedIds.includes(${JSON.stringify(printer.id)})`,
                  }}
                />
                <span>
                  <span class="text-on-surface-strong">{printer.name}</span>
                  <span class="block text-on-surface-weak">
                    {printer.city}, {printer.country}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};

export default QuoteRequestForm;
