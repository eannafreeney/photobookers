import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  analyticsIcon,
  booksIcon,
  feedIcon,
  imageSkeletonIcon,
  updatesIcon,
  usersIcon
} from "../../../../lib/icons.js";
const ProfileGuide = ({ creator }) => {
  const profileHref = `/dashboard/creators/${creator.id}`;
  const publicHref = `/creators/${creator.slug}`;
  const collaborators = creator.type === "publisher" ? "artists" : "publishers";
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsx("p", { class: "max-w-2xl text-sm md:text-base text-on-surface text-pretty", children: "Your profile is how readers, collectors, and buyers discover your work. A complete, active profile stands out in browse and search, and gives visitors a reason to follow you and click through to buy. Work through the steps below to make yours shine." }),
    /* @__PURE__ */ jsxs(
      GuideSection,
      {
        step: 1,
        icon: usersIcon(5),
        title: "Write a strong description",
        cta: { label: "Edit your profile", href: profileHref },
        children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Your description sits at the top of your profile and in the",
            " ",
            /* @__PURE__ */ jsx("strong", { children: "About" }),
            " tab. It's your chance to say who you are and what your work is about in a few sentences."
          ] }),
          /* @__PURE__ */ jsx(
            TipList,
            {
              tips: [
                "Keep it to 2\u20134 short paragraphs \u2014 concrete beats generic.",
                "Say what you make and the themes, places, or ideas behind it.",
                "Mention notable publishers, awards, or exhibitions if you have them.",
                "Add links to your website and social so visitors can follow you off-platform."
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      GuideSection,
      {
        step: 2,
        icon: imageSkeletonIcon,
        title: "Use strong profile and banner images",
        cta: { label: "Update your images", href: profileHref },
        children: [
          /* @__PURE__ */ jsx("p", { children: "Your avatar and banner are the first thing visitors see. Good imagery signals that your profile is worth exploring." }),
          /* @__PURE__ */ jsx(
            TipList,
            {
              tips: [
                "Upload high-resolution images \u2014 a wide banner (roughly 1600px across) looks sharp on every screen.",
                "Pick a recognizable avatar that still reads well at small sizes.",
                "Keep it on-brand and well-lit; avoid busy, text-heavy graphics.",
                "Aim for a consistent look between your banner, avatar, and book covers."
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      GuideSection,
      {
        step: 3,
        icon: booksIcon,
        title: "Add books with great covers",
        cta: { label: "Add a book", href: "/dashboard/books/new" },
        secondaryCta: {
          label: "Import several at once",
          href: "/dashboard/books/import"
        },
        children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Your books are the heart of your profile. Three things make the biggest difference to whether a book gets found and bought:",
            " ",
            /* @__PURE__ */ jsx("strong", { children: "tags" }),
            ", a ",
            /* @__PURE__ */ jsx("strong", { children: "good description" }),
            ", and",
            " ",
            /* @__PURE__ */ jsx("strong", { children: "proper images of both the cover and the interior" }),
            ". Don't skip them."
          ] }),
          /* @__PURE__ */ jsx(
            TipList,
            {
              tips: [
                "Add plenty of tags \u2014 themes, subjects, style, location. Tags are how readers filter and discover your book in browse and search.",
                "Write a real description: what the book is about, how it's made and printed, and why it matters. A few concrete sentences beat one generic line.",
                "Upload a proper cover shot \u2014 straight-on, true colors, sharp, and no glare.",
                "Show the interior too: add several spreads and detail images so buyers can see the paper, printing, and sequencing before they commit.",
                "Fill in the rest \u2014 title, year, and publisher \u2014 and keep sold-out or upcoming status current so visitors know what they can buy."
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
        icon: updatesIcon,
        title: "Post updates regularly",
        cta: { label: "Write a post", href: "/dashboard/posts" },
        children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Posts appear in your ",
            /* @__PURE__ */ jsx("strong", { children: "Posts" }),
            " tab and in your followers' feeds. They're the best way to stay visible between releases \u2014 share new books, signings, fairs, restocks, or behind-the-scenes moments."
          ] }),
          /* @__PURE__ */ jsx(
            TipList,
            {
              tips: [
                "Post consistently \u2014 a steady rhythm keeps you in followers' feeds.",
                "Lead with an image; posts with visuals get far more attention.",
                "Keep the text short and end with a clear link or call to action."
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      GuideSection,
      {
        step: 5,
        icon: feedIcon,
        title: "Understand your profile tabs",
        children: [
          /* @__PURE__ */ jsx("p", { children: "Your public profile organizes everything into tabs, and each one fills in automatically as you add content:" }),
          /* @__PURE__ */ jsxs("ul", { class: "flex flex-col gap-2 text-sm md:text-base text-on-surface", children: [
            /* @__PURE__ */ jsx(TabExplainer, { label: "Books", children: "Every book you've added, newest first." }),
            /* @__PURE__ */ jsx(TabExplainer, { label: "Posts", children: "Your updates \u2014 grows each time you post." }),
            /* @__PURE__ */ jsxs(TabExplainer, { label: collaborators === "artists" ? "Artists" : "Publishers", children: [
              "The ",
              collaborators,
              " you're connected to through your books."
            ] }),
            /* @__PURE__ */ jsx(TabExplainer, { label: "Fairs", children: "Book fairs you're attending, so visitors can meet you in person." }),
            /* @__PURE__ */ jsx(TabExplainer, { label: "About", children: "Your description and links \u2014 the reason to complete step 1." })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      GuideSection,
      {
        step: 6,
        icon: analyticsIcon,
        title: "Learn from your analytics",
        cta: { label: "Open analytics", href: "/dashboard/analytics" },
        children: /* @__PURE__ */ jsx("p", { children: "Analytics shows you views, favorites, and purchase clicks over time. Use it to see which books and traffic sources are working, then do more of what performs." })
      }
    ),
    /* @__PURE__ */ jsxs(
      GuideSection,
      {
        step: 7,
        icon: usersIcon(5),
        title: "Share your profile",
        cta: { label: "View your public profile", href: publicHref },
        children: [
          /* @__PURE__ */ jsx("p", { children: "The more people you send to your profile, the more follows and sales you'll see. Share your link in your Instagram bio, newsletters, and anywhere you already have an audience." }),
          creator.status !== "verified" ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: "Tip: verified creators get extra sharing tools and a share banner on their dashboard." }) : null
        ]
      }
    )
  ] });
};
var ProfileGuide_default = ProfileGuide;
const GuideSection = ({
  step,
  icon,
  title,
  cta,
  secondaryCta,
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
  cta || secondaryCta ? /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap gap-2 pt-1", children: [
    cta ? /* @__PURE__ */ jsx(
      "a",
      {
        href: cta.href,
        class: "inline-flex items-center gap-1 border border-accent px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent/10",
        children: cta.label
      }
    ) : null,
    secondaryCta ? /* @__PURE__ */ jsx(
      "a",
      {
        href: secondaryCta.href,
        class: "inline-flex items-center gap-1 border border-outline px-3 py-1.5 text-sm font-semibold text-on-surface hover:border-outline-strong",
        children: secondaryCta.label
      }
    ) : null
  ] }) : null
] });
const TipList = ({ tips }) => /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-1.5", children: tips.map((tip) => /* @__PURE__ */ jsxs("li", { class: "flex gap-2", children: [
  /* @__PURE__ */ jsx("span", { class: "mt-1 size-1.5 shrink-0 rounded-full bg-accent" }),
  /* @__PURE__ */ jsx("span", { children: tip })
] })) });
const TabExplainer = ({
  label,
  children
}) => /* @__PURE__ */ jsxs("li", { class: "flex flex-col gap-0.5 border-l-2 border-outline pl-3", children: [
  /* @__PURE__ */ jsx("span", { class: "font-semibold text-on-surface-strong", children: label }),
  /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children })
] });
export {
  ProfileGuide_default as default
};
