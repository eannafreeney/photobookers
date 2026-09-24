import Button from "../../../../components/app/Button";
import type { Printer } from "../../../../db/schema";

const fieldClass =
  "w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface";

const QuoteRequestForm = ({
  printers,
  preselectedSlug,
  modal = false,
}: {
  printers: Printer[];
  preselectedSlug?: string;
  modal?: boolean;
}) => {
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
      <template x-for="id in selectedIds" x-bind:key="id">
        <input type="hidden" name="printerIds" x-bind:value="id" />
      </template>
      <div class="grid items-start gap-6 md:grid-cols-2 md:h-[70vh]">
        <div class="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-2">
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
        </div>
        <div class="flex flex-col gap-3">
          <div class="relative" {...{ "x-on:click.outside": "countryOpen = false" }}>
            <p class="text-sm font-medium text-on-surface-strong">Country</p>
            <button
              type="button"
              class="mt-1 flex w-full items-center justify-between border border-outline bg-surface px-3 py-2 text-left text-sm"
              x-on:click="countryOpen = !countryOpen"
            >
              <span x-text="countryLabel()"></span>
              <span aria-hidden="true">▾</span>
            </button>
            <div
              x-show="countryOpen"
              x-cloak
              class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto border border-outline bg-surface p-2 shadow"
            >
              <template x-for="country in countries" x-bind:key="country">
                <label class="flex items-center gap-2 px-1 py-1 text-sm">
                  <input
                    type="checkbox"
                    {...{
                      "x-bind:checked": "selectedCountries.includes(country)",
                      "x-on:click.prevent": "toggleCountry(country)",
                    }}
                  />
                  <span x-text="country"></span>
                </label>
              </template>
            </div>
          </div>
          <p class="text-sm text-on-surface-weak">
            <span x-text="selectedIds.length"></span> of 3 selected
          </p>
          <div class="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            <template x-for="printer in printers" x-bind:key="printer.id">
              <label
                class="flex items-start gap-2 text-sm"
                x-show="visible(printer)"
              >
                <input
                  type="checkbox"
                  class="mt-1"
                  {...{
                    "x-bind:checked": "isSelected(printer.id)",
                    "x-on:click.prevent": "togglePrinter(printer.id)",
                  }}
                />
                <span>
                  <span class="text-on-surface-strong" x-text="printer.name"></span>
                  <span
                    class="block text-on-surface-weak"
                    {...{ "x-text": "printer.city + ', ' + printer.country" }}
                  ></span>
                </span>
              </label>
            </template>
          </div>
        </div>
      </div>
    </form>
  );
};

export default QuoteRequestForm;
