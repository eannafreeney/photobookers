import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  fetchInstagramData,
  generateInstagramInsights
} from "../../../../../lib/instagram-graph.js";
const InstagramAnalyticsBlock = async () => {
  const [error, data] = await fetchInstagramData();
  if (error) {
    return /* @__PURE__ */ jsx("div", { class: "rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface", children: error.message });
  }
  const insights = await generateInstagramInsights(data);
  const sorted = [...data.recentPosts].sort(
    (a, b) => b.insights.engagement - a.insights.engagement
  );
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex gap-6", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Followers", value: data.followers_count.toLocaleString() }),
      /* @__PURE__ */ jsx(Stat, { label: "Total posts", value: data.media_count.toLocaleString() }),
      /* @__PURE__ */ jsx(
        Stat,
        {
          label: "Avg engagement",
          value: `${avgEngagement(data.recentPosts)}%`
        }
      ),
      /* @__PURE__ */ jsx(
        Stat,
        {
          label: "Avg reach",
          value: avgReach(data.recentPosts).toLocaleString()
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("h3", { class: "text-base font-semibold text-on-surface", children: "AI Analysis & Post Ideas" }),
      /* @__PURE__ */ jsx("div", { class: "prose prose-sm max-w-none rounded-radius border border-outline bg-surface-container p-4 text-on-surface whitespace-pre-wrap", children: insights })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("h3", { class: "text-base font-semibold text-on-surface", children: "Recent Posts (by engagement rate)" }),
      /* @__PURE__ */ jsx("div", { class: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { class: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { class: "border-b border-outline text-xs text-on-surface-variant", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { class: "pb-2 pr-3", children: "Date" }),
          /* @__PURE__ */ jsx("th", { class: "pb-2 pr-3", children: "Type" }),
          /* @__PURE__ */ jsx("th", { class: "pb-2 pr-3", children: "Caption" }),
          /* @__PURE__ */ jsx("th", { class: "pb-2 pr-3 text-right", children: "Likes" }),
          /* @__PURE__ */ jsx("th", { class: "pb-2 pr-3 text-right", children: "Comments" }),
          /* @__PURE__ */ jsx("th", { class: "pb-2 pr-3 text-right", children: "Reach" }),
          /* @__PURE__ */ jsx("th", { class: "pb-2 pr-3 text-right", children: "Saves" }),
          /* @__PURE__ */ jsx("th", { class: "pb-2 pr-3 text-right", children: "Shares" }),
          /* @__PURE__ */ jsx("th", { class: "pb-2 text-right", children: "Eng. %" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: sorted.map((post) => /* @__PURE__ */ jsxs("tr", { class: "border-b border-outline/50", children: [
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-3 whitespace-nowrap", children: post.timestamp.slice(0, 10) }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-3", children: /* @__PURE__ */ jsx(MediaTypeBadge, { type: post.media_type }) }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-3 max-w-[200px] truncate", children: /* @__PURE__ */ jsx(
            "a",
            {
              href: post.permalink,
              target: "_blank",
              rel: "noopener",
              class: "hover:underline",
              children: post.caption?.slice(0, 60) ?? "\u2014"
            }
          ) }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-3 text-right", children: post.like_count }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-3 text-right", children: post.comments_count }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-3 text-right", children: post.insights.reach.toLocaleString() }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-3 text-right", children: post.insights.saved }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-3 text-right", children: post.insights.shares }),
          /* @__PURE__ */ jsxs("td", { class: "py-2 text-right font-medium", children: [
            post.insights.engagement,
            "%"
          ] })
        ] }, post.id)) })
      ] }) })
    ] })
  ] });
};
var InstagramAnalyticsBlock_default = InstagramAnalyticsBlock;
function Stat({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-0.5", children: [
    /* @__PURE__ */ jsx("span", { class: "text-xs text-on-surface-variant", children: label }),
    /* @__PURE__ */ jsx("span", { class: "text-lg font-semibold text-on-surface", children: value })
  ] });
}
function MediaTypeBadge({
  type
}) {
  const labels = {
    IMAGE: "\u{1F4F7}",
    VIDEO: "\u{1F3AC}",
    CAROUSEL_ALBUM: "\u{1F3A0}"
  };
  return /* @__PURE__ */ jsx("span", { title: type, children: labels[type] ?? type });
}
function avgEngagement(posts) {
  if (!posts.length) return "0";
  const avg = posts.reduce((sum, p) => sum + p.insights.engagement, 0) / posts.length;
  return avg.toFixed(1);
}
function avgReach(posts) {
  if (!posts.length) return 0;
  return Math.round(
    posts.reduce((sum, p) => sum + p.insights.reach, 0) / posts.length
  );
}
export {
  InstagramAnalyticsBlock_default as default
};
