import { emptyHeartIcon, fullHeartIcon } from "../../../lib/icons";

type Props = {
  bookId: string;
  isFavorited: boolean;
  isDisabled: boolean;
};

const FavoritePopoverRow = ({ bookId, isFavorited, isDisabled }: Props) => {
  const id = `save-fav-${bookId}`;

  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "@ajax:success": "$dispatch('save-menu:close')",
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast modal-root",
    "x-target.401": "modal-root",
  };

  return (
    <form
      id={id}
      method="post"
      action={`/api/books/${bookId}/wishlist`}
      class="w-full"
      {...alpineAttrs}
    >
      <input
        type="hidden"
        name="isFavorited"
        value={isFavorited ? "true" : "false"}
      />
      <input type="hidden" name="variant" value="popover" />
      <input type="hidden" name="shouldRefreshWishlist" value="true" />
      <button
        type="submit"
        disabled={isDisabled}
        class="cursor-pointer flex w-full items-center justify-start gap-2 px-3 py-2 text-left text-sm hover:bg-surface-alt disabled:opacity-50"
      >
        <span class="shrink-0">
          <span x-show={isFavorited ? "isSubmitting" : "!isSubmitting"} x-cloak>
            {emptyHeartIcon(4)}
          </span>
          <span x-show={isFavorited ? "!isSubmitting" : "isSubmitting"} x-cloak>
            {fullHeartIcon(4)}
          </span>
        </span>
        <span>{isFavorited ? "Favorited" : "Favorite"}</span>
      </button>
    </form>
  );
};

export default FavoritePopoverRow;
