import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../../components/layouts/AppLayout.js";
import Page from "../../../../../components/layouts/Page.js";
import MagazineIssuePage3 from "../../../../../features/app/components/magazine/MagazineIssuePage3.js";
import { paramValidator } from "../../../../../lib/validator.js";
import { idSchema } from "../../../../../features/app/schema.js";
import { getIssueByIdForAdmin } from "../../../../../domain/magazine/queries.js";
import InfoPage from "../../../../../pages/InfoPage.js";
import Link from "../../../../../components/app/Link.js";
import { getUser } from "../../../../../utils.js";
const GET = createRoute(paramValidator(idSchema), async (c) => {
  const user = await getUser(c);
  const id = c.req.valid("param").id;
  const [error, issue] = await getIssueByIdForAdmin(id);
  if (error)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
  if (!issue) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Issue not found", user }), 404);
  }
  return c.html(
    /* @__PURE__ */ jsxs(
      AppLayout,
      {
        title: `Preview \u2014 ${issue.title}`,
        currentPath: c.req.path,
        user,
        children: [
          /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center justify-between gap-2 border-b border-outline bg-surface-alt px-4 py-2 text-xs", children: [
            /* @__PURE__ */ jsxs("span", { class: "font-semibold uppercase tracking-wider text-accent", children: [
              "Preview \xB7 ",
              issue.status
            ] }),
            /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "How this issue will look when published." }),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: `/dashboard/admin/magazine/${issue.id}`,
                className: "font-medium text-on-surface hover:text-accent",
                children: "\u2190 Back to editor"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(MagazineIssuePage3, { issue }) })
        ]
      }
    )
  );
});
export {
  GET
};
