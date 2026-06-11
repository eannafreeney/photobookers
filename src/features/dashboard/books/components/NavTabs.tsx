import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import { booksIcon, mailIcon } from "../../../../lib/icons";

const NavTabs = ({ currentPath }: { currentPath?: string | null }) => {
  return (
    <nav
      id="nav-tabs"
      class="flex flex-col md:flex-row items-center justify-center border-b border-outline gap-4 mb-8 mt-4"
    >
      <NavLink href="/dashboard/books" currentPath={currentPath}>
        {booksIcon}
        Books
      </NavLink>
      <NavLink href="/dashboard/messages" currentPath={currentPath}>
        {mailIcon(5)}
        Messages
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
