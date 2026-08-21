import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Banner from "../../../../components/app/Banner.js";
import Link from "../../../../components/app/Link.js";
import Button from "../../../../components/app/Button.js";
const StubProfileBanner = ({ creator, isOwner }) => {
  if (creator.status !== "stub" || isOwner) return /* @__PURE__ */ jsx(Fragment, {});
  const claimHref = `/claims/${creator.id}/start`;
  const persistKey = `stub-profile-banner-${creator.id}`;
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-cloak": true,
      "x-data": `{ show: $persist(true).as('${persistKey}') }`,
      "x-show": "show",
      children: /* @__PURE__ */ jsx(
        Banner,
        {
          type: "info",
          message: `This profile was created by the Photobookers community from public information. Are you ${creator.displayName}?`,
          children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-2 sm:flex-row", children: [
            /* @__PURE__ */ jsx(Link, { href: claimHref, children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Claim your profile" }) }),
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
var StubProfileBanner_default = StubProfileBanner;
export {
  StubProfileBanner_default as default
};
