import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Banner from "../../../../components/app/Banner.js";
import CopyCellCol from "../../../../components/app/CopyCellCol.js";
import {
  creatorProfileUrl,
  creatorVerifiedSharePost
} from "../../../../lib/share.js";
const VerifiedCreatorShareBanner = ({ creator }) => {
  const sharePost = creatorVerifiedSharePost(creator);
  const profileUrl = creatorProfileUrl(creator.slug);
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-cloak": true,
      "x-data": "{ show: $persist(true).as(`verified-share-${creator.slug}`) }",
      "x-show": "show",
      children: /* @__PURE__ */ jsx(
        Banner,
        {
          type: "success",
          message: "You're verified! Share your profile so fans can find you.",
          children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-3 sm:flex-row", children: [
            /* @__PURE__ */ jsx(CopyCellCol, { entity: sharePost, buttonWidth: "auto" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: profileUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "text-sm underline decoration-accent underline-offset-4",
                children: "View profile"
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
          ] })
        }
      )
    }
  );
};
var VerifiedCreatorShareBanner_default = VerifiedCreatorShareBanner;
export {
  VerifiedCreatorShareBanner_default as default
};
