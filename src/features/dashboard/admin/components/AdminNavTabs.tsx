import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import {
  analyticsIcon,
  bellIcon,
  booksIcon,
  claimsIcon,
  creatorsIcon,
  plannerIcon,
  usersIcon,
} from "../../../../lib/icons";
import AdminBadge from "./AdminBadge";

const AdminNavTabs = ({ currentPath }: { currentPath?: string | null }) => {
  return (
    <nav id="nav-tabs" class="flex flex-col gap-4">
      <NavLink href="/dashboard/admin/notifications" currentPath={currentPath}>
        {bellIcon(4)}
        Notifications
        <AdminBadge xData="adminNotificationsBadge" />
      </NavLink>
      <NavLink href="/dashboard/admin/planner" currentPath={currentPath}>
        {plannerIcon}
        Planner
      </NavLink>
      <NavLink href="/dashboard/admin/analytics" currentPath={currentPath}>
        {analyticsIcon}
        Analytics
      </NavLink>
      <NavLink href="/dashboard/admin/books" currentPath={currentPath}>
        {booksIcon}
        Books
      </NavLink>
      <NavLink href="/dashboard/admin/creators" currentPath={currentPath}>
        {creatorsIcon}
        Creators
      </NavLink>
      <NavLink href="/dashboard/admin/fairs" currentPath={currentPath}>
        {plannerIcon}
        Fairs
      </NavLink>
      <NavLink href="/dashboard/admin/stores" currentPath={currentPath}>
        {plannerIcon}
        Stores
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
      <NavLink href="/dashboard/admin/interviews" currentPath={currentPath}>
        {usersIcon(5)}
        Interviews
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
    <div>
      <a
        href={href}
        prefetch="intent"
        class={clsx(
          "flex items-center gap-2 border-l-2 pl-2 -ml-2 py-0.5 transition-colors",
          isActive
            ? "font-semibold text-on-surface-strong border-accent"
            : "text-on-surface font-medium border-transparent hover:text-on-surface-strong hover:border-outline",
        )}
      >
        {children}
      </a>
    </div>
  );
};

export default AdminNavTabs;
