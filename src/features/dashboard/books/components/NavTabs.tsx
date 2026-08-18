import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import {
  analyticsIcon,
  bookIcon,
  booksIcon,
  fullHeartIcon,
  lightbulbIcon,
  libraryIcon,
  mailIcon,
  usersIcon,
} from "../../../../lib/icons";

const NavTabs = ({
  currentPath,
  creatorId,
  showProfile = false,
}: {
  currentPath?: string | null;
  creatorId: string;
  showProfile?: boolean;
}) => {
  return (
    <nav
      id="nav-tabs"
      class="flex flex-col md:flex-row flex-wrap items-center justify-center border-b border-outline gap-2 md:gap-4 mb-8 mt-4 bg-surface"
    >
      <NavLink href="/dashboard" currentPath={currentPath} exact>
        {booksIcon}
        Books
      </NavLink>
      <NavLink href="/dashboard/analytics" currentPath={currentPath}>
        {analyticsIcon}
        Analytics
      </NavLink>
      <NavLink href="/dashboard/posts" currentPath={currentPath}>
        {mailIcon(5)}
        Posts
      </NavLink>
      <NavLink href="/dashboard/shelf" currentPath={currentPath}>
        {bookIcon}
        Shelf
      </NavLink>
      <NavLink href="/dashboard/favorites" currentPath={currentPath}>
        {fullHeartIcon(5)}
        Favorites
      </NavLink>
      <NavLink href="/dashboard/lists" currentPath={currentPath}>
        {libraryIcon(5)}
        Lists
      </NavLink>
      {showProfile ? (
        <NavLink
          href={`/dashboard/creators/${creatorId}`}
          currentPath={currentPath}
        >
          {usersIcon(5)}
          Profile
        </NavLink>
      ) : null}
      <NavLink href="/dashboard/guide" currentPath={currentPath}>
        {lightbulbIcon(5)}
        Guide
      </NavLink>
    </nav>
  );
};

type NavLinkProps = PropsWithChildren<{
  href: string;
  currentPath?: string | null;
  exact?: boolean;
}>;

const NavLink = ({ href, children, currentPath, exact = false }: NavLinkProps) => {
  const isActive = exact
    ? currentPath === href
    : Boolean(currentPath?.startsWith(href));

  return (
    <li class="list-none">
      <a
        href={href}
        {...(isActive
          ? { "aria-current": "page", "x-on:click.prevent": "" }
          : {
              "x-target.push": "creator-dashboard-panel nav-tabs",
            })}
        prefetch="intent"
        class={clsx(
          "flex items-center gap-2 border-b-2 border-transparent md:-mb-px px-4 py-2 kicker transition-colors",
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
