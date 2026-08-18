import { AuthUser } from "../../../../types";
import { Book } from "../../../db/schema";
import { plusIcon } from "../../../lib/icons";
import { canWishlistBook } from "../../../lib/permissions";
import { isOk } from "../../../lib/result";
import { findWishlist } from "../services";
import { getListMembershipsForBook } from "../../../domain/lists/services";
import { userCanManageBookLists } from "../../../domain/lists/utils";
import FavouriteButton from "./FavouriteButton";
import clsx from "clsx";
import { ListMembership, ListMembershipRow } from "./ListMembershipRow";
import FavoritePopoverRow from "./FavoritePopoverRow";

type Props = {
  book: Pick<Book, "id" | "artistId" | "publisherId" | "title">;
  user: AuthUser | null;
  variant?: "circle" | "button";
};

const SaveToListButton = async ({ book, user, variant = "circle" }: Props) => {
  // Creators don't get custom lists — keep the classic favorite control.
  // if (user?.creator) {
  //   return (
  //     <FavouriteButton
  //       book={book}
  //       user={user}
  //       isCircleButton={variant === "circle"}
  //     />
  //   );
  // }

  let isFavorited = false;
  let lists: ListMembership[] = [];

  if (user?.id && userCanManageBookLists(user)) {
    isFavorited = isOk(await findWishlist(user.id, book.id));
    lists = await getListMembershipsForBook(user.id, book.id);
  } else if (user?.id) {
    isFavorited = isOk(await findWishlist(user.id, book.id));
  }

  const isDisabled = !canWishlistBook(user, book);
  const hasSaved = isFavorited || lists.some((l) => l.containsBook);
  const rootId = `save-to-list-${book.id}`;
  const canUseLists = userCanManageBookLists(user);

  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": "modal-root",
    "x-target.401": "modal-root",
  };

  // Logged out: plus posts to wishlist so the existing AuthModal path fires.
  if (!user?.id) {
    return (
      <form
        id={rootId}
        method="post"
        action={`/api/books/${book.id}/wishlist`}
        class={
          variant === "circle"
            ? "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full bg-gray-200 p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center cursor-pointer"
            : "whitespace-nowrap w-full rounded-radius border border-secondary px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center bg-transparent text-secondary cursor-pointer"
        }
        {...alpineAttrs}
      >
        <input type="hidden" name="isFavorited" value="false" />
        <button
          type="submit"
          class={clsx(
            "cursor-pointer flex items-center justify-center gap-2 w-full",
            variant === "circle" && "disabled:opacity-30",
          )}
          title="Save book"
        >
          {variant === "circle" ? (
            plusIcon(4)
          ) : (
            <>
              Save
              {plusIcon(4)}
            </>
          )}
        </button>
      </form>
    );
  }

  const triggerClass =
    variant === "circle"
      ? clsx(
          "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full bg-gray-200 p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center cursor-pointer",
          hasSaved && "ring-1 ring-accent",
        )
      : clsx(
          "flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 cursor-pointer",
          hasSaved
            ? "border-on-surface-strong bg-on-surface-strong text-on-primary"
            : "border-secondary bg-transparent text-secondary",
        );

  return (
    <div
      id={rootId}
      class={clsx("relative", variant === "button" && "w-full")}
      {...{
        "x-data": `{ open: false }`,
        "x-on:keydown.escape.window": "open = false",
        "x-on:click.outside": "open = false",
        "x-on:save-menu:close": "open = false",
      }}
    >
      <button
        type="button"
        class={triggerClass}
        title="Save to list"
        {...{ "x-on:click.stop": "open = !open" }}
      >
        {variant === "circle" ? (
          plusIcon(4)
        ) : (
          <>
            <span>Save</span>
            {plusIcon(4)}
          </>
        )}
      </button>

      <div
        {...{
          "x-show": "open",
          "x-cloak": "",
          "x-transition": "",
        }}
        class="absolute right-0 bottom-full z-100 mb-1 w-56 rounded-radius border border-outline bg-surface shadow-lg"
      >
        <div class="border-b border-outline py-1">
          <FavoritePopoverRow
            bookId={book.id}
            isFavorited={isFavorited}
            isDisabled={isDisabled}
          />
        </div>
        {canUseLists ? (
          <>
            <div class="max-h-48 overflow-y-auto py-1">
              {lists.length === 0 ? (
                <p class="px-3 py-2 text-xs text-on-surface-weak">
                  No lists yet. Create one in your dashboard.
                </p>
              ) : (
                lists.map((list) => (
                  <ListMembershipRow bookId={book.id} list={list} />
                ))
              )}
            </div>
            <div class="border-t border-outline py-1">
              <a
                href="/dashboard/lists"
                class="block px-3 py-2 text-sm text-accent hover:bg-surface-alt"
              >
                Manage lists
              </a>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SaveToListButton;
