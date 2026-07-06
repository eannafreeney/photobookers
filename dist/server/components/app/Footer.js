import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { SITE_APP, SITE_SOCIAL } from "../../constants/siteSocial.js";
const discoverLinks = () => [
  { href: "/books", label: "All Books" },
  { href: "/creators", label: "Creators" },
  { href: "/fairs", label: "Book Fairs" },
  { href: "/stores", label: "Bookstores" }
];
const FooterColumn = ({ title, links }) => /* @__PURE__ */ jsxs("nav", { class: "flex flex-col gap-3", children: [
  /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: title }),
  /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-2", children: links.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
    "a",
    {
      href: link.href,
      target: link.external ? "_blank" : void 0,
      rel: link.external ? "noopener noreferrer" : void 0,
      class: "text-sm text-on-surface hover:text-on-surface-strong hover:underline underline-offset-4 decoration-accent",
      children: link.label
    }
  ) })) })
] });
const FooterSocialLinks = () => /* @__PURE__ */ jsx("div", { class: "flex items-center gap-3 pt-1", children: /* @__PURE__ */ jsx(
  "a",
  {
    href: SITE_SOCIAL.instagram.href,
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": SITE_SOCIAL.instagram.label,
    class: "inline-flex size-9 items-center justify-center rounded-full border border-outline text-on-surface-strong transition hover:border-accent hover:text-accent",
    children: /* @__PURE__ */ jsx(
      "img",
      {
        src: "/icons/social/instagram.png",
        alt: "",
        width: 18,
        height: 18,
        class: "size-[18px] opacity-80"
      }
    )
  }
) });
const FooterAppLink = () => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 pt-2", children: [
  /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "App" }),
  /* @__PURE__ */ jsxs(
    "a",
    {
      href: SITE_APP.ios.href,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": SITE_APP.ios.label,
      class: "inline-flex w-fit items-center gap-2 rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface-strong transition hover:border-accent hover:text-accent",
      children: [
        /* @__PURE__ */ jsx(
          "svg",
          {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: /* @__PURE__ */ jsx("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83zM13.25 3.5c.67-.8 1.12-1.92 1-3.04-1.01.04-2.24.67-2.97 1.47-.62.67-1.16 1.75-1.02 2.78 1.08.08 2.19-.55 2.99-1.21z" })
          }
        ),
        "Download for iPhone"
      ]
    }
  )
] });
const Footer = () => /* @__PURE__ */ jsxs("footer", { class: "border-t-2 border-on-surface-strong bg-surface mt-6", children: [
  /* @__PURE__ */ jsxs("div", { class: "mx-auto grid w-full max-w-[1680px] gap-10 px-4 py-6 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-6", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          class: "font-logo text-3xl font-semibold text-on-surface-strong w-fit",
          children: "Photobookers"
        }
      ),
      /* @__PURE__ */ jsx("p", { class: "max-w-xs text-sm text-on-surface text-pretty", children: "The home for photobook lovers. Discover books, follow artists and publishers, and keep up with the photobook world \u2014 all in one place." }),
      /* @__PURE__ */ jsx(FooterSocialLinks, {}),
      /* @__PURE__ */ jsx(FooterAppLink, {})
    ] }),
    /* @__PURE__ */ jsx(FooterColumn, { title: "Discover", links: discoverLinks() }),
    /* @__PURE__ */ jsx(
      FooterColumn,
      {
        title: "Editorial",
        links: [
          { href: "/book-of-the-day", label: "Book of the Day" },
          { href: "/artist-of-the-week", label: "Artist of the Week" },
          { href: "/publisher-of-the-week", label: "Publisher of the Week" },
          { href: "/this-week", label: "This Week" },
          { href: "/interviews", label: "Interviews" }
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      FooterColumn,
      {
        title: "About",
        links: [
          { href: "/about", label: "About Us" },
          { href: "/newsletter", label: "Newsletter" },
          {
            href: SITE_APP.ios.href,
            label: "iOS App",
            external: true
          },
          { href: "/contact", label: "Contact" },
          { href: "/terms", label: "Terms" },
          { href: "/privacy", label: "Privacy" }
        ]
      }
    )
  ] }),
  /* @__PURE__ */ jsx("div", { class: "border-t border-outline px-4 py-4 md:px-6", children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-[1680px] flex-col items-center justify-between gap-2 md:flex-row", children: [
    /* @__PURE__ */ jsxs("p", { class: "kicker text-on-surface-weak", children: [
      "\xA9 ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Photobookers"
    ] }),
    /* @__PURE__ */ jsx("p", { class: "kicker text-on-surface-weak", children: "Made for photobook lovers, everywhere" })
  ] }) })
] });
var Footer_default = Footer;
export {
  Footer_default as default
};
