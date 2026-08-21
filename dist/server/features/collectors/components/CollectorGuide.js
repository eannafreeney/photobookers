import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { feedIcon, libraryIcon, mailIcon, usersIcon } from "../../../lib/icons.js";
const CollectorGuide = () => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsx("p", { class: "max-w-2xl text-sm md:text-base text-on-surface text-pretty", children: "Your shelf is how other people discover your taste. Make it public, favourite the books you love, curate lists, and post updates so others can follow along. Here's how to get set up." }),
    /* @__PURE__ */ jsxs(
      GuideSection,
      {
        step: 1,
        icon: usersIcon(5),
        title: "Make your shelf public",
        cta: { label: "Manage sharing settings", href: "/dashboard/shelf" },
        children: [
          /* @__PURE__ */ jsx("p", { children: "Your shelf is your public profile. Turn on sharing and pick a URL so people can find you in search and follow you. It stays private until you opt in." }),
          /* @__PURE__ */ jsx(
            TipList,
            {
              tips: [
                "Add a profile photo so your shelf feels personal.",
                "Choose a short, memorable URL."
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      GuideSection,
      {
        step: 2,
        icon: feedIcon,
        title: "Favourite the books you love",
        cta: { label: "Browse books", href: "/books" },
        children: /* @__PURE__ */ jsx("p", { children: "Tap the + button on any book, then choose Favorite. Your favourites are what visitors see first on your shelf." })
      }
    ),
    /* @__PURE__ */ jsxs(
      GuideSection,
      {
        step: 3,
        icon: libraryIcon(5),
        title: "Create lists",
        cta: { label: "Manage lists", href: "/dashboard/lists" },
        children: [
          /* @__PURE__ */ jsx("p", { children: "Build playlist-style lists \u2014 for example \u201CFavourite books of the year\u201D \u2014 and publish them on your shelf for others to browse." }),
          /* @__PURE__ */ jsx(
            TipList,
            {
              tips: [
                "Add books from any book card with the + button.",
                "Make a list public so it appears on your shelf."
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      GuideSection,
      {
        step: 4,
        icon: mailIcon(5),
        title: "Post updates",
        cta: { label: "Write a post", href: "/dashboard/posts" },
        children: [
          /* @__PURE__ */ jsx("p", { children: "Share a recent find, a favourite spread, or what you're hunting for. Posts appear on your shelf and in the feed of everyone who follows you." }),
          /* @__PURE__ */ jsx(
            TipList,
            {
              tips: [
                "Keep it short and specific.",
                "Add an image to make it stand out."
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      GuideSection,
      {
        step: 5,
        icon: usersIcon(5),
        title: "Follow other collectors",
        cta: { label: "Find collectors", href: "/creators?type=collector" },
        children: /* @__PURE__ */ jsx("p", { children: "Follow collectors whose taste you admire. Their posts show up in your feed, and following is a great way to discover new books." })
      }
    )
  ] });
};
var CollectorGuide_default = CollectorGuide;
const GuideSection = ({
  step,
  icon,
  title,
  cta,
  children
}) => /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-3 border border-outline bg-surface-alt p-5 md:p-6", children: [
  /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { class: "flex size-9 shrink-0 items-center justify-center border border-outline bg-surface text-on-surface-strong", children: icon }),
    /* @__PURE__ */ jsxs("h2", { class: "flex items-baseline gap-2 font-display text-xl md:text-2xl font-medium text-on-surface-strong", children: [
      /* @__PURE__ */ jsxs("span", { class: "text-accent tabular-nums", children: [
        step,
        "."
      ] }),
      title
    ] })
  ] }),
  /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-3 text-sm md:text-base text-on-surface text-pretty", children }),
  cta ? /* @__PURE__ */ jsx("div", { class: "flex flex-wrap gap-2 pt-1", children: /* @__PURE__ */ jsx(
    "a",
    {
      href: cta.href,
      class: "inline-flex items-center gap-1 border border-accent px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent/10",
      children: cta.label
    }
  ) }) : null
] });
const TipList = ({ tips }) => /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-1.5", children: tips.map((tip) => /* @__PURE__ */ jsxs("li", { class: "flex gap-2", children: [
  /* @__PURE__ */ jsx("span", { class: "mt-1 size-1.5 shrink-0 rounded-full bg-accent" }),
  /* @__PURE__ */ jsx("span", { children: tip })
] })) });
export {
  CollectorGuide_default as default
};
