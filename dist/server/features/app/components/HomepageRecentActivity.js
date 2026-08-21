import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  activityActorAvatarUrl,
  formatRecentActivityAge,
  recentActivityVerb,
  serializeRecentActivityItems
} from "../homepageRecentActivityUtils.js";
import HomepageActivityPulse from "./HomepageActivityPulse.js";
const CARD_CLASS = "flex h-full w-28 flex-col items-center gap-2 rounded-radius border border-outline bg-surface p-2 shadow-sm transition hover:bg-surface-alt/60";
const COVER_WRAP_CLASS = "relative flex h-24 w-full items-center justify-center";
const COVER_CLASS = "max-h-full max-w-full object-contain";
const AVATAR_CLASS = "absolute -bottom-1 -left-1 size-7 rounded-full object-cover ring-2 ring-surface bg-surface-alt";
const CAPTION_CLASS = "w-full min-w-0 flex-1 text-xs leading-snug text-on-surface text-center";
const TIME_CLASS = "text-[11px] text-on-surface-weak";
const LiveDot = () => /* @__PURE__ */ jsxs("span", { class: "relative flex size-2 shrink-0", "aria-hidden": "true", children: [
  /* @__PURE__ */ jsx(
    "span",
    {
      "x-show": "connected",
      "x-cloak": true,
      class: "absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"
    }
  ),
  /* @__PURE__ */ jsx("span", { class: "relative inline-flex size-2 rounded-full bg-accent" })
] });
const RecentActivityCard = ({
  item,
  timeLabel
}) => /* @__PURE__ */ jsx("li", { class: "list-none shrink-0", "data-recent-activity-ssr": true, children: /* @__PURE__ */ jsxs("a", { href: item.targetUrl, class: CARD_CLASS, children: [
  /* @__PURE__ */ jsxs("div", { class: COVER_WRAP_CLASS, children: [
    /* @__PURE__ */ jsx("img", { src: item.imageUrl, alt: "", class: COVER_CLASS, loading: "lazy" }),
    /* @__PURE__ */ jsx(
      "img",
      {
        src: activityActorAvatarUrl(item),
        alt: "",
        class: AVATAR_CLASS,
        loading: "lazy"
      }
    )
  ] }),
  /* @__PURE__ */ jsxs("p", { class: CAPTION_CLASS, children: [
    /* @__PURE__ */ jsx("strong", { class: "font-medium text-on-surface-strong", children: item.targetName }),
    " ",
    "was ",
    recentActivityVerb(item.type),
    " by",
    " ",
    /* @__PURE__ */ jsx("strong", { class: "font-medium text-on-surface-strong", children: item.actorName })
  ] }),
  /* @__PURE__ */ jsx("time", { datetime: item.createdAt, class: TIME_CLASS, children: timeLabel })
] }) });
const HomepageRecentActivity = ({
  items,
  currentUserId,
  hasMore = false,
  nextOffset,
  pageSize = 10,
  stats
}) => {
  if (items.length === 0 && !stats) return null;
  const serialized = serializeRecentActivityItems(items);
  const bootstrap = JSON.stringify({
    items: serialized,
    currentUserId: currentUserId ?? null,
    hasMore,
    nextOffset: nextOffset ?? serialized.length,
    pageSize
  });
  const now = Date.now();
  return /* @__PURE__ */ jsxs(
    "section",
    {
      class: "py-4",
      "aria-label": "Recent community activity",
      "data-recent-activity": bootstrap,
      ...{
        "x-data": "homepageRecentActivity()",
        "x-on:beforeunload.window": "disconnect()"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { class: "mb-6 flex flex-col items-center gap-4 border-t-2 border-on-surface-strong pt-3", children: [
          /* @__PURE__ */ jsxs("span", { class: "kicker text-accent live-label inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(LiveDot, {}),
            "Live on Photobookers"
          ] }),
          stats ? /* @__PURE__ */ jsx(
            HomepageActivityPulse,
            {
              bookViews: stats.bookViews,
              profileViews: stats.profileViews,
              className: "text-xs text-on-surface-weak text-pretty text-center"
            }
          ) : null
        ] }),
        serialized.length === 0 ? null : /* @__PURE__ */ jsx(
          "div",
          {
            "x-ref": "strip",
            "x-on:scroll": "onStripScroll($event)",
            class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            children: /* @__PURE__ */ jsxs("ul", { class: "mx-auto flex w-max items-stretch gap-3 px-1 py-1", children: [
              serialized.map((item) => /* @__PURE__ */ jsx(
                RecentActivityCard,
                {
                  item,
                  timeLabel: formatRecentActivityAge(item.createdAt, now)
                },
                item.id
              )),
              /* @__PURE__ */ jsx("template", { "x-for": "item in items", "x-bind:key": "item.id", children: /* @__PURE__ */ jsx("li", { class: "list-none shrink-0", children: /* @__PURE__ */ jsxs(
                "a",
                {
                  "x-bind:href": "item.targetUrl",
                  class: CARD_CLASS,
                  "x-bind:class": "item.isNew ? 'activity-card-new' : ''",
                  children: [
                    /* @__PURE__ */ jsxs("div", { class: COVER_WRAP_CLASS, children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          "x-bind:src": "item.imageUrl",
                          alt: "",
                          class: COVER_CLASS,
                          loading: "lazy"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          "x-bind:src": "avatar(item)",
                          alt: "",
                          class: AVATAR_CLASS,
                          loading: "lazy"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("p", { class: CAPTION_CLASS, children: [
                      /* @__PURE__ */ jsx(
                        "strong",
                        {
                          class: "font-medium text-on-surface-strong",
                          "x-text": "item.targetName"
                        }
                      ),
                      " ",
                      "was ",
                      /* @__PURE__ */ jsx("span", { "x-text": "verb(item.type)" }),
                      " by",
                      " ",
                      /* @__PURE__ */ jsx(
                        "strong",
                        {
                          class: "font-medium text-on-surface-strong",
                          "x-text": "item.actorName"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(
                      "time",
                      {
                        "x-bind:datetime": "item.createdAt",
                        class: TIME_CLASS,
                        "x-text": "timeAgo(item.createdAt)"
                      }
                    )
                  ]
                }
              ) }) }),
              /* @__PURE__ */ jsx(
                "li",
                {
                  "x-show": "loadingMore",
                  "x-cloak": true,
                  class: "list-none flex h-28 w-16 shrink-0 items-center justify-center text-xs text-on-surface-weak",
                  children: "Loading\u2026"
                }
              )
            ] })
          }
        )
      ]
    }
  );
};
var HomepageRecentActivity_default = HomepageRecentActivity;
export {
  HomepageRecentActivity_default as default
};
