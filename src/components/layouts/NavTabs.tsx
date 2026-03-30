import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import { bookIcon, feedIcon, libraryIcon, updatesIcon } from "../../lib/icons";
import FeatureGuard from "./FeatureGuard";

const NavTabs = ({ currentPath }: { currentPath?: string | null }) => {
  return (
    <nav
      id="nav-tabs"
      class="hidden md:flex items-center justify-center bg-surface-alt gap-4 mb-2 mt-2"
    >
      <NavLink href="/featured" currentPath={currentPath}>
        {bookIcon}
        Featured
      </NavLink>
      <NavLink href="/feed" currentPath={currentPath}>
        {feedIcon}
        Feed
      </NavLink>
      <NavLink href="/library" currentPath={currentPath}>
        {libraryIcon(5)}
        Library
      </NavLink>
      <FeatureGuard flagName="messages">
        <NavLink href="/messages" currentPath={currentPath}>
          {updatesIcon}
          Updates
        </NavLink>
      </FeatureGuard>
    </nav>
  );
};

type NavLinkProps = PropsWithChildren<{
  href: string;
  currentPath?: string | null;
}>;

const NavLink = ({ href, children, currentPath }: NavLinkProps) => {
  const isActive = currentPath === href;

  return (
    <li class="list-none">
      <a
        href={href}
        prefetch="intent"
        class={clsx(
          "flex items-center gap-2 border-b-2 border-transparent px-4 py-1 text-sm",
          isActive
            ? "font-bold text-primary border-primary border-b-2 border-b-primary"
            : "text-on-surface font-medium hover:border-b-outline-strong hover:text-on-surface-strong",
        )}
      >
        {children}
      </a>
    </li>
  );
};

export default NavTabs;
