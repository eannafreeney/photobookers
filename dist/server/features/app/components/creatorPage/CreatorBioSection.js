import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import ExpandableDescription from "../ExpandableDescription.js";
import CreatorBioMeta from "./CreatorBioMeta.js";
import { findFollowersCount } from "../../../../db/queries.js";
const CreatorBioSection = async ({ creator, maxWords = 75 }) => {
  const followerCount = await findFollowersCount(creator.id);
  const hasLocation = !!(creator.city || creator.country);
  const hasFollowers = followerCount > 0;
  const hasSocials = !!(creator.website || creator.facebook || creator.instagram || creator.twitter);
  const hasMeta = hasLocation || hasFollowers || hasSocials;
  const bio = creator.bio?.trim() || null;
  if (!bio) {
    if (!hasMeta) return /* @__PURE__ */ jsx(Fragment, {});
    return /* @__PURE__ */ jsx("div", { class: "flex justify-center", children: /* @__PURE__ */ jsx(
      CreatorBioMeta,
      {
        creator,
        variant: "inline",
        followerCount
      }
    ) });
  }
  if (!hasMeta) {
    return /* @__PURE__ */ jsx(ExpandableDescription, { text: bio, maxWords });
  }
  return /* @__PURE__ */ jsxs("div", { class: "flex gap-6", children: [
    /* @__PURE__ */ jsx("div", { class: "w-4/5 min-w-0", children: /* @__PURE__ */ jsx(ExpandableDescription, { text: bio, maxWords }) }),
    /* @__PURE__ */ jsx("div", { class: "flex w-1/5 flex-col items-end text-right", children: /* @__PURE__ */ jsx(
      CreatorBioMeta,
      {
        creator,
        variant: "stacked",
        align: "right",
        followerCount
      }
    ) })
  ] });
};
var CreatorBioSection_default = CreatorBioSection;
export {
  CreatorBioSection_default as default
};
