import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import AdminNewslettersTableAndFilter from "./AdminNewslettersTableAndFilter.js";
const AdminNewslettersTableContainer = async ({
  currentPath,
  currentPage
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Newsletters" }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: "/dashboard/admin/newsletters/create",
        className: "flex flex-col gap-1",
        children: [
          /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "auto", children: "Add next week" }),
          /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface-muted", children: "Creates the next Thu\u2013Wed edition after your latest newsletter." })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      AdminNewslettersTableAndFilter,
      {
        currentPath,
        currentPage
      }
    )
  ] });
};
var AdminNewslettersTableContainer_default = AdminNewslettersTableContainer;
export {
  AdminNewslettersTableContainer_default as default
};
