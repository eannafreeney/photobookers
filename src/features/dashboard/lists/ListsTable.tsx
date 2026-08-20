import { BookList } from "../../../db/schema";
import ListVisibilityToggle from "./ListVisibilityToggle";
import ListShareLink from "./ListShareLink";
import EditRowButton from "@/features/app/components/EditRowButton";
import DeleteRowButton from "@/features/app/components/DeleteRowButton";
import { isFavoritesListId } from "../../../domain/lists/utils";
import Link from "@/components/app/Link";

type ListWithCount = BookList & { bookCount: number };

type Props = {
  lists: ListWithCount[];
  ownerName: string;
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
  ownerName,
  shelfSlug,
  shelfPublic,
  isMobile = false,
}: Props) => {
  const alpineAttrs = {
    "x-init": "true",
    "@lists:updated.window":
      "$ajax('/dashboard/lists', { target: 'lists-table-container' })",
  };

  // Favorites is always present; empty state only if somehow nothing at all.
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
            ownerName={ownerName}
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
            <th class="px-4 py-3 font-medium">Share</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {lists.map((list) => {
            const isFavorites = isFavoritesListId(list.id);
            const publicUrl = listPublicUrl(list, shelfSlug, shelfPublic);
            return (
              <tr class="border-b border-outline last:border-0">
                <td class="px-4 py-3">
                  <div class="font-medium text-on-surface-strong">
                    {list.title}
                  </div>
                  {isFavorites ? (
                    <p class="mt-0.5 text-xs text-on-surface-weak">
                      Built-in — books you favorite
                    </p>
                  ) : list.description ? (
                    <p class="mt-0.5 text-xs text-on-surface-weak line-clamp-1">
                      {list.description}
                    </p>
                  ) : null}
                </td>
                <td class="px-4 py-3 tabular-nums">{list.bookCount}</td>
                <td class="px-4 py-3">
                  {isFavorites ? (
                    <span class="text-on-surface-weak">Via shelf</span>
                  ) : (
                    <ListVisibilityToggle list={list} />
                  )}
                </td>
                <td class="px-4 py-3">
                  {publicUrl ? (
                    <ListShareLink
                      listTitle={list.title}
                      ownerName={ownerName}
                      publicUrl={publicUrl}
                    />
                  ) : (
                    <span class="text-on-surface-weak">—</span>
                  )}
                </td>
                <td class="px-4 py-3 text-right">
                  {isFavorites ? (
                    <Link
                      href="/dashboard/favorites"
                      className="text-sm text-accent"
                    >
                      Manage
                    </Link>
                  ) : (
                    <div class="flex items-center justify-end gap-2">
                      <EditRowButton href={`/dashboard/lists/${list.id}`} />
                      <DeleteRowButton
                        action={`/dashboard/lists/${list.id}`}
                        confirm="Delete this list?"
                      />
                    </div>
                  )}
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
  ownerName,
  publicUrl,
}: {
  list: ListWithCount;
  ownerName: string;
  publicUrl: string | null;
}) => {
  const isFavorites = isFavoritesListId(list.id);
  return (
    <li class="rounded-radius border border-outline bg-surface overflow-hidden">
      <div class="flex flex-col gap-4 p-4">
        <div>
          <p class="font-medium text-on-surface-strong">{list.title}</p>
          {isFavorites ? (
            <p class="mt-1 text-sm text-on-surface-weak">
              Built-in — books you favorite
            </p>
          ) : list.description ? (
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
            {isFavorites ? (
              <span class="text-on-surface-weak">Via shelf</span>
            ) : (
              <ListVisibilityToggle list={list} />
            )}
          </dd>
          <dt class="text-on-surface-weak">Share</dt>
          <dd>
            {publicUrl ? (
              <ListShareLink
                listTitle={list.title}
                ownerName={ownerName}
                publicUrl={publicUrl}
              />
            ) : (
              <span class="text-on-surface-weak">—</span>
            )}
          </dd>
        </dl>
        <div class="flex flex-wrap justify-evenly items-center gap-2 border-t border-outline pt-3">
          {isFavorites ? (
            <Link href="/dashboard/favorites" className="text-sm text-accent">
              Manage
            </Link>
          ) : (
            <>
              <EditRowButton href={`/dashboard/lists/${list.id}`} />
              <DeleteRowButton
                action={`/dashboard/lists/${list.id}`}
                confirm="Delete this list?"
              />
            </>
          )}
        </div>
      </div>
    </li>
  );
};

export default ListsTable;
