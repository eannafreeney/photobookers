import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import PageHeader from "../../../components/app/PageHeader.js";
import Link from "../../../components/app/Link.js";
import { listPublishedIssues } from "../../../domain/magazine/queries.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import InfoPage from "../../../pages/InfoPage.js";
import { canonicalUrl, pageTitle, truncateDescription } from "../../../lib/seo.js";
import { getUser } from "../../../utils.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("magazine", user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const [error, issues] = await listPublishedIssues();
  if (error) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
  }
  const currentPath = c.req.path;
  const title = pageTitle("Magazine");
  const description = truncateDescription(
    "A monthly digital magazine from photobookers \u2014 themed issues with essays and curated photobooks."
  );
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/magazine"),
        currentPath,
        user,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-2xl flex-col gap-8", children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Photobookers",
              title: "Magazine",
              intro: "A monthly digital magazine. Each issue follows a theme, with an essay and eight to ten photobooks \u2014 and contributions from the artists whose work was selected."
            }
          ),
          issues.length === 0 ? /* @__PURE__ */ jsx("p", { class: "border-t border-outline pt-8 text-on-surface", children: "No issues published yet." }) : /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-4 border-t border-outline pt-8", children: issues.map((issue) => {
            const kicker = issue.kicker ?? (issue.issueNumber ? `Issue ${issue.issueNumber}` : "Issue");
            return /* @__PURE__ */ jsxs("li", { class: "flex flex-col gap-4 border-b border-outline pb-6 sm:flex-row sm:items-start sm:gap-6", children: [
              issue.coverUrl ? /* @__PURE__ */ jsx(
                Link,
                {
                  href: `/magazine/${issue.slug}`,
                  className: "shrink-0 no-underline",
                  children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: issue.coverUrl,
                      alt: `${kicker}: ${issue.title}`,
                      width: 400,
                      height: 600,
                      class: "w-32 border border-outline object-cover sm:w-36"
                    }
                  )
                }
              ) : null,
              /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
                /* @__PURE__ */ jsx("p", { class: "kicker text-accent", children: kicker }),
                /* @__PURE__ */ jsx("h2", { class: "font-display text-3xl font-medium text-on-surface-strong", children: /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/magazine/${issue.slug}`,
                    className: "hover:text-accent no-underline",
                    children: issue.title
                  }
                ) }),
                issue.subtitle ? /* @__PURE__ */ jsx("p", { class: "text-base leading-relaxed text-on-surface", children: issue.subtitle }) : null,
                issue.publishedLabel ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: issue.publishedLabel }) : null,
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/magazine/${issue.slug}`,
                    className: "text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent",
                    children: "Read issue \u2192"
                  }
                )
              ] })
            ] });
          }) })
        ] }) })
      }
    )
  );
});
export {
  GET
};
