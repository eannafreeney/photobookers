import { PropsWithChildren } from "hono/jsx";
import AdminNavTabs from "../../features/dashboard/admin/components/AdminNavTabs";

const Sidebar = ({
  children,
  currentPath,
}: PropsWithChildren & { currentPath: string }) => {
  const hasMain = children != null;

  return (
    <div class="flex min-h-[calc(100dvh-5.5rem)] w-[calc(100%+2rem)] max-w-[100vw] -mx-4 flex-col items-stretch sm:flex-row">
      <aside
        class="flex shrink-0 flex-col border-b border-outline bg-surface-alt px-4 py-4 sm:w-56 sm:border-b-0 sm:border-r sm:px-4 sm:py-6 sm:sticky sm:top-22 sm:self-start sm:max-h-[calc(100dvh-5.5rem)] sm:overflow-y-auto"
        aria-label="Admin navigation"
      >
        <span class="kicker text-accent mb-4 hidden sm:block">Admin</span>
        <AdminNavTabs currentPath={currentPath} />
      </aside>
      {hasMain ? (
        <div class="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-4 sm:py-6 sm:pl-6 sm:pr-4">
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default Sidebar;
