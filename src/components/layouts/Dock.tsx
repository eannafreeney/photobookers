import clsx from "clsx";
import { bookIcon, feedIcon, libraryIcon, updatesIcon } from "../../lib/icons";
import FeatureGuard from "./FeatureGuard";

type DockProps = {
  currentPath: string;
};

const Dock = ({ currentPath }: DockProps) => {
  console.log("currentPath", currentPath);
  return (
    <div class="md:hidden dock bg-surface-alt  text-neutral-content border border-t border-outline">
      <a
        href="/featured"
        class={clsx(
          "dock-item",
          currentPath === "/featured" ? "dock-active" : "",
        )}
      >
        {bookIcon}
        <span class="dock-label">Featured</span>
      </a>
      <a
        href="/feed"
        class={clsx("dock-item", currentPath === "/feed" ? "dock-active" : "")}
      >
        {feedIcon}
        <span class="dock-label">Feed</span>
      </a>
      <a
        href="/library"
        class={clsx(
          "dock-item",
          currentPath === "/library" ? "dock-active" : "",
        )}
      >
        {libraryIcon}
        <span class="dock-label">Library</span>
      </a>
      <FeatureGuard flagName="messages">
        <a
          href="/messages"
          class={clsx(
            "dock-item",
            currentPath === "/messages" ? "dock-active" : "",
          )}
        >
          {updatesIcon}
          <span class="dock-label">Updates</span>
        </a>
      </FeatureGuard>
    </div>
  );
};

export default Dock;
