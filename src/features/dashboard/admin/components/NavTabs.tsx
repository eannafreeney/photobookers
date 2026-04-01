import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import {
  bellIcon,
  booksIcon,
  claimsIcon,
  creatorsIcon,
  mailIcon,
  plannerIcon,
  usersIcon,
} from "../../../../lib/icons";
import AdminBadge from "./AdminBadge";

const NavTabs = ({ currentPath }: { currentPath?: string | null }) => {
  return (
    <nav
      id="nav-tabs"
      class="flex flex-col md:flex-row items-center justify-center bg-surface-alt gap-4 mb-8 mt-4"
    >
      <NavLink href="/dashboard/admin/notifications" currentPath={currentPath}>
        {bellIcon(4)}
        Notifications
        <AdminBadge xData="adminNotificationsBadge" />
      </NavLink>
      <NavLink href="/dashboard/admin/planner" currentPath={currentPath}>
        {plannerIcon}
        Planner
      </NavLink>
      <NavLink href="/dashboard/admin/books" currentPath={currentPath}>
        {booksIcon}
        Books
      </NavLink>
      <NavLink href="/dashboard/admin/creators" currentPath={currentPath}>
        {creatorsIcon}
        Creators
      </NavLink>
      <NavLink href="/dashboard/admin/users" currentPath={currentPath}>
        {usersIcon(5)}
        Users
      </NavLink>
      <NavLink href="/dashboard/admin/claims" currentPath={currentPath}>
        {claimsIcon}
        Claims
        <AdminBadge xData="adminClaimsBadge" />
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
