import { Context } from "hono";
import { createRoute } from "hono-fsr";
import NavSearch from "../../../components/layouts/NavSearch";
import { DISCOVER_TAGS } from "../../../constants/discover";
import { tagBooksUrl } from "../../../lib/tags";
import Link from "../../../components/app/Link";
import { capitalize } from "../../../utils";
import { closeIcon } from "../../../components/layouts/NavSearchMobile";
import Pill from "../../../components/app/Pill";

export const GET = createRoute(async (c: Context) => {
  return c.html(
    <div
      id="search-results-mobile-container"
      class="fixed top-0 left-0 right-0 bottom-0 w-full z-10 backdrop-blur-2xl"
      x-data="{ isOpen: true }"
      x-show="isOpen"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between gap-4 p-4">
          <NavSearch isMobile />
          <button x-on:click="isOpen = false">{closeIcon}</button>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-6 p-4">
          {DISCOVER_TAGS.map((tag) => (
            <Link href={tagBooksUrl(tag)} key={tag}>
              <Pill key={tag}>{capitalize(tag)}</Pill>
            </Link>
          ))}
        </div>
      </div>
    </div>,
  );
});
