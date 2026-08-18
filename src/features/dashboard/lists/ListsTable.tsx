import { BookList } from "../../../db/schema";
import Link from "../../../components/app/Link";
import Button from "../../../components/app/Button";
import FormDelete from "../../../components/forms/FormDelete";
import ListVisibilityToggle from "./ListVisibilityToggle";
import EditRowButton from "@/features/app/components/EditRowButton";
import DeleteRowButton from "@/features/app/components/DeleteRowButton";

type ListWithCount = BookList & { bookCount: number };

type Props = {
  lists: ListWithCount[];
  shelfSlug?: string | null;
  shelfPublic?: boolean;
};

const ListsTable = ({ lists, shelfSlug, shelfPublic }: Props) => {
  const alpineAttrs = {
    "x-init": "true",
    "@lists:updated.window":
      "$ajax('/dashboard/lists', { target: 'lists-table-container' })",
  };

  if (lists.length === 0) {
    return (
      <div x-data id="lists-table-container" {...alpineAttrs}>
        <div class="rounded border border-outline bg-surface-alt p-6 text-sm text-on-surface">
          <p class="mb-3">You don’t have any lists yet.</p>
          <p class="text-on-surface-weak">
            Create a list like “Favourite books of the year”, then add books
            from any book card with the + button.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      x-data
      id="lists-table-container"
      class="overflow-x-auto border border-outline"
      {...alpineAttrs}
    >
      <table class="w-full text-left text-sm">
        <thead class="border-b border-outline bg-surface-alt kicker text-on-surface-weak">
          <tr>
            <th class="px-4 py-3 font-medium">Title</th>
            <th class="px-4 py-3 font-medium">Books</th>
            <th class="px-4 py-3 font-medium">Visibility</th>
            <th class="px-4 py-3 font-medium">Public URL</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {lists.map((list) => {
            const publicUrl =
              shelfPublic && shelfSlug && list.isPublic
                ? `/shelf/${shelfSlug}/lists/${list.slug}`
                : null;
            return (
              <tr class="border-b border-outline last:border-0">
                <td class="px-4 py-3">
                  <div class="font-medium text-on-surface-strong">
                    {list.title}
                  </div>
                  {list.description ? (
                    <p class="mt-0.5 text-xs text-on-surface-weak line-clamp-1">
                      {list.description}
                    </p>
                  ) : null}
                </td>
                <td class="px-4 py-3 tabular-nums">{list.bookCount}</td>
                <td class="px-4 py-3">
                  <ListVisibilityToggle list={list} />
                </td>
                <td class="px-4 py-3">
                  {publicUrl ? (
                    <a
                      href={publicUrl}
                      class="text-accent underline underline-offset-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    <span class="text-on-surface-weak">—</span>
                  )}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <EditRowButton href={`/dashboard/lists/${list.id}`} />
                    <DeleteRowButton action={`/dashboard/lists/${list.id}`} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListsTable;
