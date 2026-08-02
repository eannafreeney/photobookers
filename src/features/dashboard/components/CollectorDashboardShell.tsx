import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import Page from "../../../components/layouts/Page";
import {
  bookIcon,
  fullHeartIcon,
  lightbulbIcon,
  libraryIcon,
  mailIcon,
} from "../../../lib/icons";

type Props = PropsWithChildren<{
  currentPath: string;
}>;

const CollectorDashboardShell = ({ children, currentPath }: Props) => {
  return (
    <Page>
      <nav
        id="nav-tabs"
        class="flex flex-col md:flex-row flex-wrap items-center justify-center border-b border-outline gap-2 md:gap-4 mb-8 mt-4 bg-surface"
      >
        <NavLink href="/dashboard/shelf" currentPath={currentPath}>
          {bookIcon}
          Shelf
        </NavLink>
        <NavLink href="/dashboard/favorites" currentPath={currentPath}>
          {fullHeartIcon(5)}
          Favorites
        </NavLink>
        <NavLink href="/dashboard/posts" currentPath={currentPath}>
          {mailIcon(5)}
          Posts
        </NavLink>
        <NavLink href="/dashboard/lists" currentPath={currentPath}>
          {libraryIcon(5)}
          Lists
        </NavLink>
        <NavLink href="/dashboard/guide" currentPath={currentPath}>
          {lightbulbIcon(5)}
          Guide
        </NavLink>
      </nav>

      <div
        id="collector-dashboard-panel"
        class="flex flex-col gap-8"
        x-merge="replace"
      >
        {children}
      </div>
    </Page>
  );
};

type NavLinkProps = PropsWithChildren<{
  href: string;
  currentPath?: string | null;
}>;

const NavLink = ({ href, children, currentPath }: NavLinkProps) => {
  const isActive = Boolean(currentPath?.startsWith(href));

  return (
    <li class="list-none">
      <a
        href={href}
        {...(isActive
          ? { "aria-current": "page", "x-on:click.prevent": "" }
          : { "x-target": "collector-dashboard-panel nav-tabs" })}
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

export default CollectorDashboardShell;
