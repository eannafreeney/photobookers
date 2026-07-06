import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "./Link.js";
const SocialLinks = ({
  creator,
  className = "flex gap-4 items-center justify-center text-xs mt-4"
}) => {
  if (!creator.website && !creator.facebook && !creator.instagram && !creator.twitter)
    return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { class: className, children: [
    creator.website && /* @__PURE__ */ jsx(
      Link,
      {
        href: creator.website,
        target: "_blank",
        className: "text-on-surface-strong transition-colors hover:text-[#0099cc]",
        children: webIcon
      }
    ),
    creator.facebook && /* @__PURE__ */ jsx(
      Link,
      {
        href: creator.facebook,
        target: "_blank",
        className: "text-on-surface-strong transition-colors hover:text-[#0099cc]",
        children: facebookIcon
      }
    ),
    creator.instagram && /* @__PURE__ */ jsx(
      Link,
      {
        href: creator.instagram,
        target: "_blank",
        className: "text-on-surface-strong transition-colors hover:text-[#0099cc]",
        children: instagramIcon
      }
    ),
    creator.twitter && /* @__PURE__ */ jsx(
      Link,
      {
        href: creator.twitter,
        target: "_blank",
        className: "text-on-surface-strong transition-colors hover:text-[#0099cc]",
        children: twitterIcon
      }
    )
  ] });
};
var SocialLinks_default = SocialLinks;
const webIcon = /* @__PURE__ */ jsxs(
  "svg",
  {
    width: "24px",
    height: "24px",
    "stroke-width": "1.5",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M10.5857 10.5857L16.9496 7.0502L13.4141 13.4142M10.5857 10.5857L7.05012 16.9497L13.4141 13.4142M10.5857 10.5857L13.4141 13.4142",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M19 12H18",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M6 12H5",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M12 5V6",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M12 18V19",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M7.05029 7.05029L7.7574 7.7574",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M16.2427 16.2427L16.9498 16.9498",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      )
    ]
  }
);
const facebookIcon = /* @__PURE__ */ jsxs(
  "svg",
  {
    width: "24px",
    height: "24px",
    "stroke-width": "1.5",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M11 21C11 18 11 15 11 12C11 9.8125 11.5 8 15 8",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M9 13H11H15",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      )
    ]
  }
);
const twitterIcon = /* @__PURE__ */ jsxs(
  "svg",
  {
    width: "24px",
    height: "24px",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M16.8198 20.7684L3.75317 3.96836C3.44664 3.57425 3.72749 3 4.22678 3H6.70655C6.8917 3 7.06649 3.08548 7.18016 3.23164L20.2468 20.0316C20.5534 20.4258 20.2725 21 19.7732 21H17.2935C17.1083 21 16.9335 20.9145 16.8198 20.7684Z",
          stroke: "currentColor",
          "stroke-width": "1.5"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M20 3L4 21",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round"
        }
      )
    ]
  }
);
const instagramIcon = /* @__PURE__ */ jsxs(
  "svg",
  {
    width: "24px",
    height: "24px",
    "stroke-width": "1.5",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z",
          stroke: "currentColor",
          "stroke-width": "1.5"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M17.5 6.51L17.51 6.49889",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      )
    ]
  }
);
export {
  SocialLinks_default as default
};
