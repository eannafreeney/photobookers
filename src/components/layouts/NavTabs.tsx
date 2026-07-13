import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import { bookIcon, feedIcon, libraryIcon } from "../../lib/icons";

const NavTabs = ({ currentPath }: { currentPath?: string | null }) => {
  return (
    <nav
      id="nav-tabs"
      class="hidden md:flex items-center justify-center border-b border-outline gap-4 mb-2 mt-2"
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
        Shelf
      </NavLink>
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
          "flex items-center gap-2 border-b-2 border-transparent -mb-px px-4 py-2 kicker transition-colors",
          isActive
            ? "text-on-surface-strong border-b-accent"
            : "text-on-surface-weak hover:text-on-surface-strong",
        )}
      >
        {children}
      </a>
    </li>
  );
};

export default NavTabs;
