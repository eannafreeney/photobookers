import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Banner from "../../../components/app/Banner.js";
const CreatorOwnerPostCta = ({
  creatorSlug,
  postCount
}) => {
  const message = postCount === 0 ? "Share fair dates, studio news, or work-in-progress with people who follow you." : "Keep your followers in the loop \u2014 share your latest news on your profile.";
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-cloak": true,
      "x-data": `{ show: $persist(true).as('owner-post-cta-${creatorSlug}') }`,
      "x-show": "show",
      children: /* @__PURE__ */ jsx(Banner, { type: "info", message, children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/dashboard/messages",
            class: "shrink-0 text-sm font-medium text-accent hover:underline",
            children: postCount === 0 ? "Write your first post" : "Write a post"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "x-on:click": "show = false",
            class: "text-sm cursor-pointer hover:opacity-75",
            children: "Dismiss"
          }
        )
      ] }) })
    }
  );
};
var CreatorOwnerPostCta_default = CreatorOwnerPostCta;
export {
  CreatorOwnerPostCta_default as default
};
