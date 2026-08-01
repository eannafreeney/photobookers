import { AuthUser } from "../../../../types";
import { Book } from "../../../db/schema";
import {
  checkIcon,
  emptyHeartIcon,
  fullHeartIcon,
  plusIcon,
} from "../../../lib/icons";
import { canWishlistBook } from "../../../lib/permissions";
import { isOk } from "../../../lib/result";
import { findWishlist } from "../services";
import { getListMembershipsForBook } from "../../../domain/lists/services";
import { userCanManageBookLists } from "../../../domain/lists/utils";
import FavouriteButton from "./FavouriteButton";
import clsx from "clsx";

type SaveToListButtonProps = {
  book: Pick<Book, "id" | "artistId" | "publisherId" | "title">;
  user: AuthUser | null;
  /** Full-width text button (book detail) vs circle icon (cards). */
  variant?: "circle" | "button";
};

type ListMembership = {
  id: string;
  title: string;
  containsBook: boolean;
};

export const FavoritePopoverRow = ({
  bookId,
  isFavorited,
  isDisabled,
}: {
  bookId: string;
  isFavorited: boolean;
  isDisabled: boolean;
}) => {
  const id = `save-fav-${bookId}`;

  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
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

type ListMembershipRowProps = {
  bookId: string;
  list: ListMembership;
};

export const ListMembershipRow = ({ bookId, list }: ListMembershipRowProps) => {
  const id = `save-list-${bookId}-${list.id}`;
  const alreadyInList = list.containsBook;

  const alpineAttrs = alreadyInList
    ? {}
    : {
        "x-data": "{ isSubmitting: false }",
        "@ajax:before": "isSubmitting = true",
        "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
        "@ajax:error": "isSubmitting = false",
        "x-target": `${id} toast modal-root`,
        "x-target.error": "toast modal-root",
        "x-target.401": "modal-root",
      };

  return (
    <form
      id={id}
      method="post"
      action={
        alreadyInList ? undefined : `/api/books/${bookId}/lists/${list.id}`
      }
      class="w-full"
      {...alpineAttrs}
    >
      {!alreadyInList ? (
        <input type="hidden" name="isInList" value="false" />
      ) : null}
      <button
        type={alreadyInList ? "button" : "submit"}
        disabled={alreadyInList}
        title={alreadyInList ? "Already in this list" : `Add to ${list.title}`}
        class={clsx(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer",
          alreadyInList
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-surface-alt",
        )}
      >
        <span
          class={clsx(
            "flex size-4 shrink-0 items-center justify-center",
            alreadyInList ? "text-accent" : "text-on-surface-weak",
          )}
        >
          {alreadyInList ? checkIcon(4) : plusIcon(3)}
        </span>
        <span class="min-w-0 truncate">{list.title}</span>
      </button>
    </form>
  );
};

// Inline Alpine so ajax-injected cards don't depend on Alpine.data registration.
const saveToListXData = `{ open: false }`;

const SaveToListButton = async ({
  book,
  user,
  variant = "circle",
}: SaveToListButtonProps) => {
  // Creators don't get custom lists — keep the classic favorite control.
  if (user?.creator) {
    return (
      <FavouriteButton
        book={book}
        user={user}
        isCircleButton={variant === "circle"}
      />
    );
  }

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
            : "whitespace-nowrap w-full rounded-radius border border-secondary px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center bg-transparent text-secondary"
        }
        x-data="{ isSubmitting: false }"
        {...{
          "@ajax:before": "isSubmitting = true",
          "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
          "@ajax:error": "isSubmitting = false",
          "x-target": "modal-root",
          "x-target.401": "modal-root",
        }}
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
          "flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75",
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
        class="absolute right-0 bottom-full z-[100] mb-1 w-56 rounded-radius border border-outline bg-surface shadow-lg"
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
