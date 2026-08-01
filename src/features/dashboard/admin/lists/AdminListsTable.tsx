import { BookList } from "../../../../db/schema";
import ListPromoteToggleForm from "./ListPromoteToggleForm";

export type AdminListRow = BookList & {
  bookCount: number;
  canPromote: boolean;
  owner: {
    id: string;
    displayName: string;
    shelfSlug: string | null;
    shelfPublic: boolean;
  };
};

type Props = {
  lists: AdminListRow[];
};

const AdminListsTable = ({ lists }: Props) => {
  if (lists.length === 0) {
    return (
      <p class="text-sm text-on-surface-weak">No public lists found.</p>
    );
  }

  return (
    <div class="overflow-x-auto border border-outline">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-outline bg-surface-alt kicker text-on-surface-weak">
          <tr>
            <th class="px-4 py-3 font-medium">Title</th>
            <th class="px-4 py-3 font-medium">Owner</th>
            <th class="px-4 py-3 font-medium">Books</th>
            <th class="px-4 py-3 font-medium">Public URL</th>
            <th class="px-4 py-3 font-medium">Homepage</th>
          </tr>
        </thead>
        <tbody>
          {lists.map((list) => {
            const publicUrl =
              list.owner.shelfPublic && list.owner.shelfSlug
                ? `/shelf/${list.owner.shelfSlug}/lists/${list.slug}`
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
                <td class="px-4 py-3">{list.owner.displayName}</td>
                <td class="px-4 py-3 tabular-nums">{list.bookCount}</td>
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
                    <span class="text-on-surface-weak">Shelf private</span>
                  )}
                </td>
                <td class="px-4 py-3">
                  <ListPromoteToggleForm
                    listId={list.id}
                    isPromoted={list.isPromoted}
                    canPromote={list.canPromote}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminListsTable;
