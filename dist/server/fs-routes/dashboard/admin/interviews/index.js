import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
import InterviewsTableContainer from "../../../../features/dashboard/admin/interviews/components/InterviewsTableContainer.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const interviewsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Interviews", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(
      InterviewsTableContainer,
      {
        searchQuery,
        currentPage,
        currentPath: interviewsPaginationBaseUrl
      }
    ) }) }) })
  );
});
export {
  GET
};
