import { BookList } from "../../../db/schema";
import ListVisibilityToggle from "./ListVisibilityToggle";
import EditRowButton from "@/features/app/components/EditRowButton";
import DeleteRowButton from "@/features/app/components/DeleteRowButton";

type ListWithCount = BookList & { bookCount: number };

type Props = {
  lists: ListWithCount[];
  shelfSlug?: string | null;
  shelfPublic?: boolean;
  isMobile?: boolean;
};

const listPublicUrl = (
  list: ListWithCount,
  shelfSlug?: string | null,
  shelfPublic?: boolean,
) =>
  shelfPublic && shelfSlug && list.isPublic
    ? `/shelf/${shelfSlug}/lists/${list.slug}`
    : null;

const ListsTable = ({
  lists,
  shelfSlug,
  shelfPublic,
  isMobile = false,
}: Props) => {
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

  if (isMobile) {
    return (
      <ul
        x-data
        id="lists-table-container"
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        {lists.map((list) => (
          <ListCardMobile
            list={list}
            publicUrl={listPublicUrl(list, shelfSlug, shelfPublic)}
          />
        ))}
      </ul>
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
            const publicUrl = listPublicUrl(list, shelfSlug, shelfPublic);
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
                    <DeleteRowButton
                      action={`/dashboard/lists/${list.id}`}
                      confirm="Delete this list?"
                    />
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

const ListCardMobile = ({
  list,
  publicUrl,
}: {
  list: ListWithCount;
  publicUrl: string | null;
}) => (
  <li class="rounded-radius border border-outline bg-surface overflow-hidden">
    <div class="flex flex-col gap-4 p-4">
      <div>
        <p class="font-medium text-on-surface-strong">{list.title}</p>
        {list.description ? (
          <p class="mt-1 text-sm text-on-surface-weak line-clamp-2">
            {list.description}
          </p>
        ) : null}
      </div>
      <dl class="grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-3 text-sm">
        <dt class="text-on-surface-weak">Books</dt>
        <dd class="tabular-nums">{list.bookCount}</dd>
        <dt class="text-on-surface-weak">Visibility</dt>
        <dd>
          <ListVisibilityToggle list={list} />
        </dd>
        <dt class="text-on-surface-weak">Public</dt>
        <dd>
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
        </dd>
      </dl>
      <div class="flex flex-wrap justify-evenly items-center gap-2 border-t border-outline pt-3">
        <EditRowButton href={`/dashboard/lists/${list.id}`} />
        <DeleteRowButton
          action={`/dashboard/lists/${list.id}`}
          confirm="Delete this list?"
        />
      </div>
    </div>
  </li>
);

export default ListsTable;
