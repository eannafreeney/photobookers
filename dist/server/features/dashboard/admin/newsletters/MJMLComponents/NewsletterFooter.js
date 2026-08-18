import { jsx, jsxs } from "react/jsx-runtime";
import { MjmlSection, MjmlColumn, MjmlText } from "mjml-react";
import { brand, newsletterNavLinks, newsletterSocial } from "../constants.js";
const NewsletterFooter = () => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "24px 0 32px", children: /* @__PURE__ */ jsxs(MjmlColumn, { children: [
  /* @__PURE__ */ jsx(
    MjmlText,
    {
      align: "center",
      fontSize: "14px",
      lineHeight: "1.6",
      color: brand.onSurface,
      padding: "0 25px 16px",
      children: "The home for photobook lovers. Discover books, follow artists and publishers, and keep up with the photobook world."
    }
  ),
  /* @__PURE__ */ jsx(MjmlText, { align: "center", padding: "0 25px 16px", children: newsletterNavLinks().map((link, index) => /* @__PURE__ */ jsxs("span", { children: [
    index > 0 ? /* @__PURE__ */ jsx("span", { style: { color: brand.onSurfaceWeak }, children: " \xB7 " }) : null,
    /* @__PURE__ */ jsx(
      "a",
      {
        href: link.href,
        style: { color: brand.onSurfaceWeak, textDecoration: "none" },
        children: link.label
      }
    )
  ] }, link.href)) }),
  /* @__PURE__ */ jsx(MjmlText, { align: "center", padding: "0 25px 16px", children: /* @__PURE__ */ jsx("a", { href: newsletterSocial.instagramUrl, children: /* @__PURE__ */ jsx(
    "img",
    {
      src: newsletterSocial.instagramIconUrl,
      alt: "Instagram",
      width: "20",
      height: "20",
      style: { display: "inline-block" }
    }
  ) }) }),
  /* @__PURE__ */ jsxs(
    MjmlText,
    {
      align: "center",
      fontSize: "13px",
      color: brand.onSurfaceWeak,
      padding: "0 25px",
      children: [
        "\xA9 ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Photobookers"
      ]
    }
  )
] }) });
export {
  NewsletterFooter
};
