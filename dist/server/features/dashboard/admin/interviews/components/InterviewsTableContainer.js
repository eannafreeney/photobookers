import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import TableSearch from "../../../../../components/app/TableSearch.js";
import InterviewsTableAndFilter from "./InterviewsTableAdmin.js";
const InterviewsTableContainer = ({
  searchQuery,
  currentPage,
  currentPath
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Interviews" }),
    /* @__PURE__ */ jsx("div", { class: "flex items-center justify-between gap-4", children: /* @__PURE__ */ jsx(
      TableSearch,
      {
        target: "interviews-table-container",
        action: "/dashboard/admin/interviews",
        placeholder: "Filter interviews..."
      }
    ) }),
    /* @__PURE__ */ jsx(
      InterviewsTableAndFilter,
      {
        currentPage,
        searchQuery,
        currentPath
      }
    )
  ] });
};
var InterviewsTableContainer_default = InterviewsTableContainer;
export {
  InterviewsTableContainer_default as default
};
