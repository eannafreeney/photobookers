import type { BookStore } from "../../../../db/schema";
import { formatCountry } from "../../../../lib/utils";

type Props = {
  stores: BookStore[];
};

/**
 * Bookstores as a scannable directory rather than cards: at homepage size the
 * useful facts are the name and the city.
 */
const StoresColumns = ({ stores }: Props) => (
  <ul class="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
    {stores.map((store) => (
      <li key={store.id} class="border-t border-outline first:border-t-0 sm:first:border-t">
        <a
          href={`/stores/${store.slug}`}
          class="group flex items-baseline justify-between gap-3 py-3"
        >
          <span class="min-w-0 flex-1">
            <span class="block truncate font-medium text-on-surface-strong group-hover:underline decoration-accent underline-offset-4">
              {store.name}
            </span>
            <span class="block truncate text-sm text-on-surface-weak">
              {[store.city, formatCountry(store.country)]
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

export default StoresColumns;
