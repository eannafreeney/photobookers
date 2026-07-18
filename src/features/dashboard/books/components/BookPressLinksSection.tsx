import Button from "../../../../components/app/Button";
import SectionTitle from "../../../../components/app/SectionTitle";
import { MAX_BOOK_PRESS_LINKS } from "../pressLinks";

/**
 * Press links editor for book forms. Expects parent Alpine bookForm /
 * bookFormAdmin context with bookPressLinksAlpineMethods().
 */
const BookPressLinksSection = () => {
  return (
    <div class="md:col-span-2 space-y-3">
      <div class="flex items-center justify-between gap-4">
        <SectionTitle className="mb-0">Press / reviews</SectionTitle>
        <Button
          type="button"
          variant="outline"
          color="primary"
          width="auto"
          {...{
            "x-on:click": "openPressModal()",
            "x-bind:disabled": `pressLinks.length >= ${MAX_BOOK_PRESS_LINKS}`,
          }}
        >
          Add press link
        </Button>
      </div>
      <p class="text-sm text-on-surface/70">
        Link to external reviews or features (max {MAX_BOOK_PRESS_LINKS}). Shown
        on the public book page.
      </p>

      <input
        type="hidden"
        name="press_links"
        {...{ "x-bind:value": "form.press_links" }}
      />

      <ul class="space-y-2" {...{ "x-show": "pressLinks.length > 0" }}>
        <template
          {...{
            "x-for": "(link, index) in pressLinks",
            "x-bind:key": "index",
          }}
        >
          <li class="flex items-start justify-between gap-3 rounded-radius border border-outline bg-surface-alt p-3">
            <div class="min-w-0 space-y-1">
              <p
                class="font-medium text-on-surface-strong truncate"
                {...{ "x-text": "link.title" }}
              ></p>
              <p
                class="text-xs text-on-surface/60 truncate"
                {...{ "x-text": "pressLinkHost(link.url)" }}
              ></p>
              <p
                class="text-sm italic text-on-surface/80 line-clamp-2"
                {...{ "x-show": "link.quote", "x-text": "link.quote" }}
              ></p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button
                type="button"
                class="text-xs font-semibold uppercase tracking-wide text-accent hover:opacity-75"
                {...{ "x-on:click": "openPressModal(index)" }}
              >
                Edit
              </button>
              <button
                type="button"
                class="text-xs font-semibold uppercase tracking-wide text-danger hover:opacity-75"
                {...{ "x-on:click": "removePressLink(index)" }}
              >
                Remove
              </button>
            </div>
          </li>
        </template>
      </ul>

      <p
        class="text-sm text-on-surface/60"
        {...{ "x-show": "pressLinks.length === 0" }}
      >
        No press links yet.
      </p>

      <div
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 pb-8 backdrop-blur-md sm:items-center lg:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="press-link-modal-title"
        {...{
          "x-show": "pressModalOpen",
          "x-cloak": true,
          "x-on:keydown.esc.window": "closePressModal()",
          "x-on:click.self": "closePressModal()",
        }}
      >
        <div
          class="flex w-full max-w-lg flex-col gap-4 rounded-radius border border-outline bg-surface text-on-surface shadow-xl"
          {...{ "x-on:click.stop": "" }}
        >
          <div class="flex items-center justify-between border-b border-outline p-4">
            <h3
              id="press-link-modal-title"
              class="font-semibold tracking-wide text-on-surface-strong"
              {...{
                "x-text":
                  "pressEditIndex === null ? 'Add press link' : 'Edit press link'",
              }}
            ></h3>
            <button
              type="button"
              aria-label="Close"
              class="text-on-surface transition hover:opacity-75 cursor-pointer"
              {...{ "x-on:click": "closePressModal()" }}
            >
              ×
            </button>
          </div>
          <div class="space-y-3 px-4 pb-4">
            <div>
              <label
                for="press-draft-title"
                class="mb-1 block text-sm font-medium"
              >
                Outlet / title
              </label>
              <input
                id="press-draft-title"
                type="text"
                maxlength={120}
                class="w-full rounded-radius border border-outline bg-surface px-3 py-2 text-sm"
                placeholder="British Journal of Photography"
                {...{ "x-model": "pressDraft.title" }}
              />
            </div>
            <div>
              <label
                for="press-draft-url"
                class="mb-1 block text-sm font-medium"
              >
                URL
              </label>
              <input
                id="press-draft-url"
                type="url"
                class="w-full rounded-radius border border-outline bg-surface px-3 py-2 text-sm"
                placeholder="https://…"
                {...{ "x-model": "pressDraft.url" }}
              />
            </div>
            <div>
              <label
                for="press-draft-quote"
                class="mb-1 block text-sm font-medium"
              >
                Pull quote (optional)
              </label>
              <textarea
                id="press-draft-quote"
                maxlength={500}
                rows={3}
                class="w-full rounded-radius border border-outline bg-surface px-3 py-2 text-sm"
                placeholder="A short excerpt from the review"
                {...{ "x-model": "pressDraft.quote" }}
              />
            </div>
            <p
              class="text-sm text-danger"
              {...{ "x-show": "pressModalError", "x-text": "pressModalError" }}
            ></p>
            <div class="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                color="secondary"
                width="auto"
                {...{ "x-on:click": "closePressModal()" }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="solid"
                color="primary"
                width="auto"
                {...{ "x-on:click": "savePressLink()" }}
              >
                Save link
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPressLinksSection;
