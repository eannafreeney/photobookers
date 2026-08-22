import { DISCOVER_TAGS } from "../../../constants/discover";
import { tagBooksUrl } from "../../../lib/tags";

/**
 * Compact theme strip — sits under the navbar on the homepage as a second
 * browse rail. Cover Groups further down carry the same tags with art.
 */
const DiscoveryTagChips = () => (
  <nav
    class="-mx-4 flex gap-2 overflow-x-auto border-b border-outline px-4 py-3 md:-mx-8 md:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    aria-label="Browse photobooks by theme"
  >
    <div class="mx-auto flex min-w-max flex-wrap items-center justify-center gap-2 md:flex-wrap">
      {DISCOVER_TAGS.map((tag) => (
        <a
          key={tag}
          href={tagBooksUrl(tag)}
          class="shrink-0 rounded-radius border border-outline bg-surface px-3 py-1 text-xs capitalize text-on-surface transition hover:border-on-surface-strong hover:text-on-surface-strong"
        >
          {tag}
        </a>
      ))}
    </div>
  </nav>
);

export default DiscoveryTagChips;
