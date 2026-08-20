import { DISCOVER_TAGS } from "../../../constants/discover";
import { tagBooksUrl } from "../../../lib/tags";

/**
 * A light "something to click" row for visitors the hero didn't catch.
 * Deliberately text-only — the Groups section below carries the same idea
 * with covers, and two image grids in a row read as one.
 */
const DiscoveryTagChips = () => (
  <nav
    class="flex flex-wrap items-center justify-center gap-2 "
    aria-label="Browse photobooks by theme"
  >
    {/* <span class="kicker text-on-surface-weak mr-1">Browse</span> */}
    {DISCOVER_TAGS.map((tag) => (
      <a
        key={tag}
        href={tagBooksUrl(tag)}
        class="rounded-radius border border-outline bg-surface px-3 py-1 text-xs capitalize text-on-surface transition hover:border-on-surface-strong hover:text-on-surface-strong"
      >
        {tag}
      </a>
    ))}
  </nav>
);

export default DiscoveryTagChips;
