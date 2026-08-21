import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import ShareButton from "../../api/components/ShareButton.js";
import { listShareText, listShareTitle } from "../../../lib/share.js";
const absoluteUrl = (path) => {
  const siteUrl = (process.env.SITE_URL ?? "https://photobookers.com").replace(
    /\/$/,
    ""
  );
  return `${siteUrl}${path}`;
};
const ListShareLink = ({
  listTitle,
  ownerName,
  publicUrl,
  layout = "compact"
}) => {
  const fullUrl = absoluteUrl(publicUrl);
  if (layout === "detail") {
    return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 rounded-radius border border-outline bg-surface-alt p-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { class: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { class: "text-sm font-medium text-on-surface-strong", children: "Share this list" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: publicUrl,
            class: "mt-1 block break-all text-sm text-accent underline underline-offset-2",
            target: "_blank",
            rel: "noreferrer",
            children: fullUrl
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { class: "shrink-0 sm:w-40", children: /* @__PURE__ */ jsx(
        ShareButton,
        {
          title: listShareTitle(listTitle),
          text: listShareText(listTitle, ownerName),
          url: fullUrl
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: publicUrl,
        class: "text-accent underline underline-offset-2",
        target: "_blank",
        rel: "noreferrer",
        children: "View"
      }
    ),
    /* @__PURE__ */ jsx(
      ShareButton,
      {
        variant: "inline",
        title: listShareTitle(listTitle),
        text: listShareText(listTitle, ownerName),
        url: fullUrl
      }
    )
  ] });
};
var ListShareLink_default = ListShareLink;
export {
  ListShareLink_default as default
};
