import Modal from "@/components/app/Modal";
import FormPost from "@/components/forms/FormPost";
import type { MagazineIssuePlacement } from "@/domain/magazine/queries";

type Book = MagazineIssuePlacement["book"];

/** Cover + gallery images for one book, de-duped, cover first — the full set an
 *  admin can choose the issue's featured image from. */
export const collectPlacementImageOptions = (book: Book): string[] => {
  const raw = [
    book?.coverUrl,
    ...(book?.images?.map((image) => image.imageUrl) ?? []),
  ].filter(Boolean) as string[];
  return Array.from(new Set(raw));
};

type Props = {
  action: string;
  bookId: string;
  /** Card target id (`magazine-book-${number}`) so the save can swap it. */
  number: number;
  title: string;
  imageOptions: string[];
  selectedImageUrl: string | null;
};

const SelectImageModal = ({
  action,
  bookId,
  number,
  title,
  imageOptions,
  selectedImageUrl,
}: Props) => {
  const saveAttrs = {
    // Swap the book card (new thumbnail) and prepend a toast, then close.
    "x-target": `magazine-book-${number} toast`,
    "x-target.error": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close')",
  };

  return (
    <Modal title={`Featured image — ${title}`} maxWidth="max-w-2xl">
      {imageOptions.length === 0 ? (
        <p class="text-sm text-on-surface">
          This book has no images to choose from.
        </p>
      ) : (
        <FormPost action={`${action}/image`} {...saveAttrs}>
          <input type="hidden" name="bookId" value={bookId} />
          <p class="mb-3 text-sm text-on-surface">
            Pick the single image to feature for this book in the issue.
          </p>
          <div class="max-h-[min(55vh,calc(100dvh-14rem))] overflow-y-auto overscroll-contain rounded border border-outline/60 bg-surface p-2">
            <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {/* Revert to the book's default (cover / first image). */}
              <label class="flex aspect-3/4 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-outline p-1 text-center text-[0.65rem] text-on-surface-weak [&:has(input:checked)]:border-primary [&:has(input:checked)]:text-on-surface-strong [&:has(input:checked)]:ring-2 [&:has(input:checked)]:ring-primary">
                <input
                  type="radio"
                  name="imageUrl"
                  value=""
                  checked={!selectedImageUrl}
                  class="sr-only"
                />
                Book default
              </label>
              {imageOptions.map((url) => (
                <label
                  key={url}
                  class="cursor-pointer rounded border border-outline p-1 [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-2 [&:has(input:checked)]:ring-primary"
                >
                  <input
                    type="radio"
                    name="imageUrl"
                    value={url}
                    checked={url === selectedImageUrl}
                    class="sr-only"
                  />
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    class="aspect-3/4 w-full rounded object-cover"
                  />
                </label>
              ))}
            </div>
          </div>
          <div class="mt-4 flex items-center gap-3 border-t border-outline pt-4">
            <button
              type="submit"
              class="rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer"
            >
              Save image
            </button>
            <button
              type="button"
              x-on:click="$dispatch('dialog:close')"
              class="rounded border border-outline px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-alt cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </FormPost>
      )}
    </Modal>
  );
};

export default SelectImageModal;
