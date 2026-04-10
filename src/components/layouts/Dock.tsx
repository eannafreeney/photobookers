import clsx from "clsx";
import { bookIcon, feedIcon, libraryIcon, updatesIcon } from "../../lib/icons";
import FeatureGuard from "./FeatureGuard";

type DockProps = {
  currentPath?: string;
};

// Base styles for each nav item — mirrors .dock > * from DaisyUI source.
// The ::after pseudo-element is the active indicator pill at the bottom.
const itemBase = clsx(
  "relative mb-2 flex h-full max-w-32 shrink basis-full cursor-pointer",
  "flex-col items-center justify-center gap-px rounded-xl bg-transparent",
  "transition-opacity duration-200 ease-out hover:opacity-80",
  "after:absolute after:content-[''] after:h-1 after:rounded-full",
  "after:bottom-[0.2rem] after:transition-all after:duration-100 after:ease-out",
);

// Active: widen the pill and fill it with currentColor
const itemActive = "after:w-10 after:bg-current";
// Inactive: narrow transparent pill (keeps layout stable)
const itemInactive = "after:w-6 after:bg-transparent";

const Dock = ({ currentPath }: DockProps) => {
  const item = (path: string) =>
    clsx(itemBase, currentPath === path ? itemActive : itemInactive);

  return (
    <div
      class={clsx(
        "md:hidden z-100 sticky bottom-0 left-0 right-0",
        "flex w-full flex-row items-center justify-around p-2",
        "h-[calc(4rem+env(safe-area-inset-bottom))]",
        "pb-[env(safe-area-inset-bottom)]",
        "bg-surface-alt text-neutral-content border-t border-outline",
      )}
    >
      <a href="/featured" class={item("/featured")}>
        {bookIcon}
        <span class="text-[0.6875rem]">Discover</span>
      </a>
      <a href="/feed" class={item("/feed")}>
        {feedIcon}
        <span class="text-[0.6875rem]">Feed</span>
      </a>
      <a href="/library" class={item("/library")}>
        {libraryIcon(5)}
        <span class="text-[0.6875rem]">Library</span>
      </a>
      <FeatureGuard flagName="messages">
        <a href="/messages" class={item("/messages")}>
          {updatesIcon}
          <span class="text-[0.6875rem]">Updates</span>
        </a>
      </FeatureGuard>
    </div>
  );
};

export default Dock;
