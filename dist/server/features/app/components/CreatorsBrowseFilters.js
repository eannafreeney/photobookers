import { jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../components/app/Pill.js";
import { creatorsBrowseUrl, CREATOR_CATALOG_TARGET_ID } from "../creatorsBrowse.js";
const pillButtonClass = "cursor-pointer border-0 bg-transparent p-0 font-inherit";
const CreatorsBrowseFilters = ({ activeFilter, user }) => {
  const filters = [
    { id: "all", label: "All" },
    { id: "artist", label: "Artists" },
    { id: "publisher", label: "Publishers" }
  ];
  if (user) {
    filters.push({ id: "following", label: "Following" });
  }
  return /* @__PURE__ */ jsx("div", { class: "mb-8 flex justify-center items-center gap-2", children: filters.map((filter) => /* @__PURE__ */ jsx(
    "a",
    {
      href: creatorsBrowseUrl(filter.id, { fragment: true }),
      "x-target": CREATOR_CATALOG_TARGET_ID,
      prefetch: "intent",
      "aria-current": activeFilter === filter.id ? "page" : void 0,
      class: pillButtonClass,
      children: /* @__PURE__ */ jsx(Pill, { variant: activeFilter === filter.id ? "inverse" : "default", children: filter.label })
    }
  )) });
};
var CreatorsBrowseFilters_default = CreatorsBrowseFilters;
export {
  CreatorsBrowseFilters_default as default
};
