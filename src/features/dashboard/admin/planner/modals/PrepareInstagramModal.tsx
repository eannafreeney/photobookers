import Modal from "../../../../../components/app/Modal";
import FormPost from "../../../../../components/forms/FormPost";
import { toDateString } from "../../../../../lib/utils";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import {
  buildDefaultInstagramCaption,
  collectBookImageOptions,
} from "../instagramCaption";
import { formatDayLabel } from "../utils";

type Props = {
  week: string;
  entries: BookOfTheDayWithBook[];
};

const PrepareInstagramModal = ({ week, entries }: Props) => {
  const alpineAttrs = {
    "x-target": "toast modal-root",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
  };

  return (
    <Modal title={`Prepare Instagram – week ${week}`}>
      {entries.length === 0 ? (
        <p class="text-sm text-on-surface">
          Schedule books of the day for this week before preparing Instagram
          posts.
        </p>
      ) : (
        <div class="max-h-[min(75vh,calc(100dvh-5rem))] overflow-hidden">
        <FormPost
          action={`/dashboard/admin/planner/instagram/${week}/prepare`}
          class="flex h-full max-h-[min(75vh,calc(100dvh-5rem))] flex-col"
          {...alpineAttrs}
        >
          <input type="hidden" name="week" value={week} />
          <div class="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
          {entries.map((entry) => {
            const dateKey = toDateString(entry.date);
            const book = entry.book;
            if (!book) return null;

            const imageOptions = collectBookImageOptions(book);
            const defaultCaption =
              entry.instagramCaption ??
              buildDefaultInstagramCaption(book);
            const selectedImage =
              entry.instagramImageUrl ?? imageOptions[0] ?? "";

            return (
              <section
                key={entry.id}
                class="rounded border border-outline bg-surface-alt/40 p-4"
              >
                <h3 class="mb-3 text-sm font-semibold text-on-surface-strong">
                  {formatDayLabel(entry.date)}
                </h3>
                <p class="mb-3 text-xs text-on-surface line-clamp-2">
                  {book.title}
                </p>

                <fieldset class="mb-4">
                  <legend class="mb-2 block text-xs font-medium text-on-surface">
                    Image
                  </legend>
                  {imageOptions.length === 0 ? (
                    <p class="text-xs text-danger">
                      This book has no images available.
                    </p>
                  ) : (
                    <div class="max-h-48 overflow-y-auto overscroll-contain rounded border border-outline/60 bg-surface p-2">
                      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {imageOptions.map((url) => (
                        <label
                          key={url}
                          class="cursor-pointer rounded border border-outline p-1 [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-2 [&:has(input:checked)]:ring-primary"
                        >
                          <input
                            type="radio"
                            name={`imageUrl[${dateKey}]`}
                            value={url}
                            required
                            checked={url === selectedImage}
                            class="sr-only"
                          />
                          <img
                            src={url}
                            alt=""
                            class="aspect-[3/4] w-full rounded object-cover"
                          />
                        </label>
                      ))}
                      </div>
                    </div>
                  )}
                </fieldset>

                <label class="block text-xs font-medium text-on-surface">
                  Caption
                  <textarea
                    name={`captions[${dateKey}]`}
                    required
                    rows={5}
                    class="mt-1 w-full rounded border border-outline bg-surface px-3 py-2 text-sm"
                  >
                    {defaultCaption}
                  </textarea>
                </label>
              </section>
            );
          })}
          </div>
          <button
            type="submit"
            class="mt-4 shrink-0 rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer"
          >
            Save
          </button>
        </FormPost>
        </div>
      )}
    </Modal>
  );
};

export default PrepareInstagramModal;
