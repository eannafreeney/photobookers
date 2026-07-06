import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import AdminNavTabs from "../../features/dashboard/admin/components/AdminNavTabs.js";
const Sidebar = ({
  children,
  currentPath
}) => {
  const hasMain = children != null;
  return /* @__PURE__ */ jsxs("div", { class: "flex min-h-[calc(100dvh-5.5rem)] w-[calc(100%+2rem)] max-w-[100vw] -mx-4 flex-col items-stretch sm:flex-row", children: [
    /* @__PURE__ */ jsxs(
      "aside",
      {
        class: "flex shrink-0 flex-col border-b border-outline bg-surface-alt px-4 py-4 sm:w-56 sm:border-b-0 sm:border-r sm:px-4 sm:py-6 sm:overflow-y-auto",
        "aria-label": "Admin navigation",
        children: [
          /* @__PURE__ */ jsx("span", { class: "kicker text-accent mb-4 hidden sm:block", children: "Admin" }),
          /* @__PURE__ */ jsx(AdminNavTabs, { currentPath })
        ]
      }
    ),
    hasMain ? /* @__PURE__ */ jsx("div", { class: "flex min-h-0 min-w-0 flex-1 flex-col px-4 py-4 sm:py-6 sm:pl-6 sm:pr-4", children }) : null
  ] });
};
var Sidebar_default = Sidebar;
export {
  Sidebar_default as default
};
