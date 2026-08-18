import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import FollowersCount from "../../../../components/app/FollowersCount.js";
import SocialLinks from "../../../../components/app/SocialLinks.js";
import { findFollowersCount } from "../../../../db/queries.js";
import { formatCountry } from "../../../../lib/utils.js";
const CreatorBioMeta = async ({
  creator,
  variant = "inline",
  align = "left",
  followerCount: followerCountProp
}) => {
  const followerCount = followerCountProp ?? await findFollowersCount(creator.id);
  const hasLocation = !!(creator.city || creator.country);
  const hasFollowers = followerCount > 10;
  const hasSocials = !!(creator.website || creator.facebook || creator.instagram || creator.twitter || creator.substack);
  if (!hasLocation && !hasFollowers && !hasSocials) return /* @__PURE__ */ jsx(Fragment, {});
  if (variant === "stacked") {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        class: `flex flex-col gap-2 text-sm text-on-surface ${align === "right" ? "items-end text-right" : ""}`,
        children: [
          hasLocation && /* @__PURE__ */ jsxs("span", { children: [
            creator.city ? `${creator.city}, ` : "",
            formatCountry(creator.country ?? "")
          ] }),
          hasFollowers && /* @__PURE__ */ jsx(FollowersCount, { count: followerCount }),
          hasSocials && /* @__PURE__ */ jsx(
            SocialLinks,
            {
              creator,
              className: `flex items-center gap-3 ${align === "right" ? "justify-end" : ""}`
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-center gap-3 text-sm text-on-surface", children: [
    hasLocation && /* @__PURE__ */ jsxs("span", { children: [
      creator.city ? `${creator.city}, ` : "",
      formatCountry(creator.country ?? "")
    ] }),
    hasFollowers && /* @__PURE__ */ jsxs(Fragment, { children: [
      hasLocation && /* @__PURE__ */ jsx("span", { "aria-hidden": "true", class: "text-on-surface-weak", children: "\xB7" }),
      /* @__PURE__ */ jsx(FollowersCount, { count: followerCount })
    ] }),
    hasSocials && /* @__PURE__ */ jsxs(Fragment, { children: [
      (hasLocation || hasFollowers) && /* @__PURE__ */ jsx("span", { "aria-hidden": "true", class: "text-on-surface-weak", children: "\xB7" }),
      /* @__PURE__ */ jsx(
        SocialLinks,
        {
          creator,
          className: "inline-flex items-center gap-3"
        }
      )
    ] })
  ] });
};
var CreatorBioMeta_default = CreatorBioMeta;
export {
  CreatorBioMeta_default as default
};
