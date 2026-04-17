import { PropsWithChildren } from "hono/jsx";
import {
  closeIcon,
  closeMobileMenuIcon,
  openMobileMenuIcon,
} from "../../lib/icons";
import NavTabs from "../../features/dashboard/admin/components/NavTabs";
import { fadeTransition } from "../../lib/transitions";
import AdminNavTabs from "../../features/dashboard/admin/components/NavTabs";

const Sidebar = ({
  children,
  currentPath,
}: PropsWithChildren & { currentPath: string }) => {
  const alpineAttrs = {
    "x-data": "{ sidebarIsOpen: false }",
    "x-on:click.outside": "sidebarIsOpen = false",
    "x-on:keydown.esc.window": "sidebarIsOpen = false",
  };
  return (
    <>
      <div {...alpineAttrs}>
        {/* toggle button */}
        <button
          class="fixed bottom-24 md:bottom-4 left-4 z-10 rounded-full bg-primary p-4 text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:outline-offset-0 cursor-pointer"
          x-on:click="sidebarIsOpen = !sidebarIsOpen"
        >
          {openIcon}
        </button>

        {/* sidebar */}
        <nav
          x-cloak
          x-show="sidebarIsOpen"
          x-trap="sidebarIsOpen"
          class="fixed left-0 z-20 flex h-svh w-72 shrink-0 flex-col border-r border-outline bg-surface px-8 transition-transform duration-300"
          x-transition:enter="transition duration-200 ease-out"
          x-transition:enter-end="translate-x-0"
          x-transition:enter-start="-translate-x-full"
          x-transition:leave="transition ease-in duration-200"
          x-transition:leave-end="-translate-x-full"
          x-transition:leave-start="translate-x-0"
        >
          <div class="flex items-center justify-end mb-2">
            <button
              class="text-on-surface cursor-pointer"
              x-on:click="sidebarIsOpen = false"
            >
              {closeIcon}
            </button>
          </div>
          <AdminNavTabs currentPath={currentPath} />
        </nav>
      </div>

      <>{children}</>
    </>
  );
};

export default Sidebar;

const openIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);
