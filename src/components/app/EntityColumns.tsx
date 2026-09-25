import type { BookStore, Printer } from "../../db/schema";
import { formatCountry } from "../../lib/utils";

type Props = {
  entities: (BookStore | Printer)[];
  hrefBase: "/stores" | "/printers";
  emptyMessage?: string;
};

/** Name and city as a scannable directory. */
const EntityColumns = ({ entities, hrefBase, emptyMessage }: Props) => {
  if (entities.length === 0) {
    return emptyMessage ? (
      <div class="text-center text-sm text-on-surface py-4">{emptyMessage}</div>
    ) : null;
  }

  return (
    <ul class="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
      {entities.map((entity) => (
        <li
          key={entity.id}
          class="border-t border-outline first:border-t-0 sm:first:border-t"
        >
          <a
            href={`${hrefBase}/${entity.slug}`}
            class="group flex items-center justify-between gap-3 py-3"
          >
            {entity.coverUrl ? (
              <img
                src={entity.coverUrl}
                alt={entity.name}
                class="w-12 h-12 object-cover rounded-radius"
              />
            ) : null}
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-on-surface-strong group-hover:underline decoration-accent underline-offset-4">
                {entity.name}
              </span>
              <span class="block truncate text-sm text-on-surface-weak">
                {[entity.city, formatCountry(entity.country)]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </span>
            <span class="kicker shrink-0 text-on-surface-weak transition-colors group-hover:text-on-surface-strong">
              →
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default EntityColumns;
