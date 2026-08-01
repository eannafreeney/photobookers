import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import IssueActions from "./IssueActions.js";
import DetailsForm from "./DetailsForm.js";
import SelectedBooks from "./SelectedBooks.js";
import IssueHeader from "./IssueHeader.js";
const AdminIssueEditor = ({ issue, nextNumber }) => {
  const action = `/dashboard/admin/magazine/${issue.id}`;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsx(IssueHeader, { issue }),
    /* @__PURE__ */ jsx(IssueActions, { issue, action, nextNumber }),
    /* @__PURE__ */ jsx(DetailsForm, { issue, action }),
    /* @__PURE__ */ jsx(SelectedBooks, { issue, action })
  ] });
};
export {
  AdminIssueEditor
};
