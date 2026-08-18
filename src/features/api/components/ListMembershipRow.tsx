import { checkIcon, plusIcon } from "../../../lib/icons";
import clsx from "clsx";

export type ListMembership = {
  id: string;
  title: string;
  containsBook: boolean;
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
        "@ajax:success": "$dispatch('save-menu:close')",
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
