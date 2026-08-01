import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import InfoPage from "../../pages/InfoPage.js";
import { isFeatureEnabledForUser } from "../../lib/features.js";
import { getPublicCollectors } from "../../domain/collectors/services.js";
import { getInitialsAvatar } from "../../lib/avatar.js";
import { pageTitle } from "../../lib/seo.js";
const collectorName = (c) => [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || "Collector";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  if (!isFeatureEnabledForUser("collectors", user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const searchQuery = c.req.query("search")?.trim() ?? "";
  const [error, collectors] = await getPublicCollectors(searchQuery);
  const results = error || !collectors ? [] : collectors;
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: pageTitle("Collectors"),
        description: "Discover collectors and browse their shelves.",
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              title: "Collectors",
              intro: "Discover collectors and browse the photobooks they love."
            }
          ),
          /* @__PURE__ */ jsxs("form", { method: "get", action: "/collectors", class: "mb-6 flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "search",
                name: "search",
                value: searchQuery,
                placeholder: "Search collectors by name",
                class: "w-full max-w-md rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface",
                autocomplete: "off"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                class: "rounded-radius border border-secondary px-4 py-2 text-sm font-medium text-secondary hover:opacity-75",
                children: "Search"
              }
            )
          ] }),
          results.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: searchQuery ? `No collectors found for "${searchQuery}".` : "No public collectors yet." }) : /* @__PURE__ */ jsx("ul", { class: "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5", children: results.map((collector) => {
            const name = collectorName(collector);
            const avatarUrl = collector.profileImageUrl ?? getInitialsAvatar(
              collector.firstName ?? "",
              collector.lastName ?? ""
            );
            return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              "a",
              {
                href: `/shelf/${collector.shelfSlug}`,
                class: "flex flex-col items-center gap-2 rounded-radius border border-outline bg-surface p-4 text-center transition-colors hover:border-outline-strong",
                children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: avatarUrl,
                      alt: name,
                      class: "size-16 rounded-full object-cover",
                      loading: "lazy"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { class: "truncate text-sm font-medium text-on-surface-strong", children: name })
                ]
              }
            ) });
          }) })
        ] })
      }
    )
  );
});
export {
  GET
};
