import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { bookIcon, feedIcon, libraryIcon, updatesIcon } from "../../lib/icons.js";
import FeatureGuard from "./FeatureGuard.js";
const itemBase = clsx(
  "relative mb-2 flex h-full max-w-32 shrink basis-full cursor-pointer",
  "flex-col items-center justify-center gap-px rounded-xl bg-transparent",
  "transition-opacity duration-200 ease-out hover:opacity-80",
  "after:absolute after:content-[''] after:h-1 after:rounded-full",
  "after:bottom-[0.2rem] after:transition-all after:duration-100 after:ease-out"
);
const itemActive = "after:w-10 after:bg-accent text-on-surface-strong";
const itemInactive = "after:w-6 after:bg-transparent text-on-surface-weak";
const Dock = ({ currentPath }) => {
  const item = (path) => clsx(itemBase, currentPath === path ? itemActive : itemInactive);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      class: clsx(
        "md:hidden z-100 sticky bottom-0 left-0 right-0",
        "flex w-full flex-row items-center justify-around p-2",
        "h-[calc(4rem+env(safe-area-inset-bottom))]",
        "pb-[env(safe-area-inset-bottom)]",
        "bg-surface border-t border-on-surface-strong"
      ),
      children: [
        /* @__PURE__ */ jsxs("a", { href: "/featured", class: item("/featured"), children: [
          bookIcon,
          /* @__PURE__ */ jsx("span", { class: "text-[0.625rem] uppercase tracking-[0.12em] font-medium", children: "Discover" })
        ] }),
        /* @__PURE__ */ jsxs("a", { href: "/feed", class: item("/feed"), children: [
          feedIcon,
          /* @__PURE__ */ jsx("span", { class: "text-[0.625rem] uppercase tracking-[0.12em] font-medium", children: "Feed" })
        ] }),
        /* @__PURE__ */ jsxs("a", { href: "/library", class: item("/library"), children: [
          libraryIcon(5),
          /* @__PURE__ */ jsx("span", { class: "text-[0.625rem] uppercase tracking-[0.12em] font-medium", children: "Library" })
        ] }),
        /* @__PURE__ */ jsx(FeatureGuard, { flagName: "messages", children: /* @__PURE__ */ jsxs("a", { href: "/messages", class: item("/messages"), children: [
          updatesIcon,
          /* @__PURE__ */ jsx("span", { class: "text-[0.625rem] uppercase tracking-[0.12em] font-medium", children: "Messages" })
        ] }) })
      ]
    }
  );
};
var Dock_default = Dock;
export {
  Dock_default as default
};
