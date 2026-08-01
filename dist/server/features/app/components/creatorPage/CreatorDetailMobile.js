import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import CreatorDetailTabs from "./CreatorDetailTab.js";
import FollowButton from "../../../api/components/FollowButton.js";
import ShareButton from "../../../api/components/ShareButton.js";
import CreatorOwnerPostCta from "../CreatorOwnerPostCta.js";
import CreatorPageBanner from "./CreatorPageBanner.js";
import { creatorUrl } from "../../spotlightUrls.js";
import { creatorShareText } from "../../../../lib/share.js";
import MobileHeader from "../MobileHeader.js";
const CreatorDetailMobile = (props) => {
  const { creator, user, isOwner, postCount } = props;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      CreatorPageBanner,
      {
        bannerUrl: creator.bannerUrl,
        displayName: creator.displayName
      }
    ),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx(
        MobileHeader,
        {
          kicker: creator.type === "publisher" ? "Publisher" : "Artist",
          title: creator.displayName ?? void 0,
          isVerified: creator.status === "verified",
          children: /* @__PURE__ */ jsxs("div", { class: "flex justify-between items-center gap-2", children: [
            !isOwner && /* @__PURE__ */ jsx(FollowButton, { creator, variant: "mobile", user }),
            /* @__PURE__ */ jsx(
              ShareButton,
              {
                title: creator.displayName,
                text: creatorShareText(creator),
                url: creatorUrl(creator.slug)
              }
            )
          ] })
        }
      ),
      isOwner && /* @__PURE__ */ jsx(
        CreatorOwnerPostCta,
        {
          creatorSlug: creator.slug,
          postCount
        }
      ),
      /* @__PURE__ */ jsx(CreatorDetailTabs, { isMobile: true, ...props })
    ] })
  ] });
};
var CreatorDetailMobile_default = CreatorDetailMobile;
export {
  CreatorDetailMobile_default as default
};
