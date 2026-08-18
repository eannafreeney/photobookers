import { jsx, jsxs } from "react/jsx-runtime";
import { Section, Row, Column, Text, Button, Img } from "@react-email/components";
import { brand, newsletterNavLinks, newsletterSocial } from "../constants.js";
const NewsletterFooter = () => /* @__PURE__ */ jsx(Section, { children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsxs(Column, { children: [
  /* @__PURE__ */ jsx(
    Text,
    {
      style: { color: brand.onSurface },
      className: "m-0 text-sm leading-[1.6] px-[25px] text-center",
      children: "The home for photobook lovers. Discover books, follow artists and publishers, and keep up with the photobook world."
    }
  ),
  /* @__PURE__ */ jsx(Section, { className: "text-center my-6", children: newsletterNavLinks().map((link, index) => /* @__PURE__ */ jsxs("span", { children: [
    index > 0 ? /* @__PURE__ */ jsx("span", { style: { color: brand.onSurfaceWeak }, children: " \xB7 " }) : null,
    /* @__PURE__ */ jsx(Button, { href: link.href, style: { color: brand.onSurfaceWeak }, children: link.label })
  ] }, link.href)) }),
  /* @__PURE__ */ jsx(Section, { className: "text-center mb-6", children: /* @__PURE__ */ jsx(Button, { href: newsletterSocial.instagramUrl, children: /* @__PURE__ */ jsx(
    Img,
    {
      src: newsletterSocial.instagramIconUrl,
      alt: "Instagram",
      width: "20",
      height: "20",
      style: { display: "block", margin: "0 auto" }
    }
  ) }) }),
  /* @__PURE__ */ jsxs(
    Text,
    {
      style: { color: brand.onSurfaceWeak },
      className: "m-0 text-sm leading-[1.6] px-[25px] text-center",
      children: [
        "\xA9 ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Photobookers"
      ]
    }
  )
] }) }) });
export {
  NewsletterFooter
};
