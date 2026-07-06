import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const followerLabel = (count) => count === 1 ? "follower" : "followers";
const formatFollowerCount = (count) => {
  if (count >= 1e6) {
    const value = count / 1e6;
    return value >= 10 ? `${Math.round(value)}M` : `${value.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1e4) {
    return `${Math.round(count / 1e3)}k`;
  }
  if (count >= 1e3) {
    const value = count / 1e3;
    return `${value.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toLocaleString();
};
const FollowersCount = ({ count }) => {
  if (count === 0) return null;
  const label = followerLabel(count);
  return /* @__PURE__ */ jsxs("section", { class: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("div", { class: "font-display text-base font-medium tabular-nums text-on-surface-strong", children: formatFollowerCount(count) }),
    /* @__PURE__ */ jsx("div", { class: "kicker mt-0.5 text-on-surface-weak", children: ` ${label}` })
  ] });
};
var FollowersCount_default = FollowersCount;
export {
  FollowersCount_default as default
};
