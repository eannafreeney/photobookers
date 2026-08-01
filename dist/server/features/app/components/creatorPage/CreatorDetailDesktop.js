import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FollowButton from "../../../api/components/FollowButton.js";
import ShareButton from "../../../api/components/ShareButton.js";
import CreatorOwnerPostCta from "../CreatorOwnerPostCta.js";
import CreatorPageBanner from "./CreatorPageBanner.js";
import { creatorUrl } from "../../spotlightUrls.js";
import { creatorShareText } from "../../../../lib/share.js";
import ClaimCreatorBtn from "../../../claims/components/ClaimCreatorBtn.js";
import CreatorDetailTabs from "./CreatorDetailTab.js";
import CreatorAvatar from "./CreatorAvatar.js";
import CreatorBioSection from "./CreatorBioSection.js";
const CreatorDetailDesktop = (props) => {
  const { creator, user, isOwner, postCount, currentPath } = props;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(
      CreatorPageBanner,
      {
        bannerUrl: creator.bannerUrl,
        displayName: creator.displayName
      }
    ),
    /* @__PURE__ */ jsxs("div", { class: "flex justify-between border-b-2 border-on-surface-strong pb-4", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(CreatorAvatar, { creator }),
        /* @__PURE__ */ jsx("h1", { class: "text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-6xl", children: creator.displayName })
      ] }),
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-end justify-end gap-3", children: [
        /* @__PURE__ */ jsxs("div", { class: `grid gap-4 ${isOwner ? "grid-cols-1" : "grid-cols-2"}`, children: [
          !isOwner && /* @__PURE__ */ jsx(
            FollowButton,
            {
              creator,
              user,
              shouldRefreshCreatorMessages: true
            }
          ),
          /* @__PURE__ */ jsx(
            ShareButton,
            {
              title: creator.displayName,
              text: creatorShareText(creator),
              url: creatorUrl(creator.slug)
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          ClaimCreatorBtn,
          {
            creator,
            user,
            currentPath
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx(CreatorBioSection, { creator }),
      isOwner && /* @__PURE__ */ jsx(
        CreatorOwnerPostCta,
        {
          creatorSlug: creator.slug,
          postCount
        }
      ),
      /* @__PURE__ */ jsx(CreatorDetailTabs, { ...props })
    ] })
  ] });
};
var CreatorDetailDesktop_default = CreatorDetailDesktop;
export {
  CreatorDetailDesktop_default as default
};
