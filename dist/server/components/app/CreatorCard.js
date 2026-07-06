import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Card from "./Card.js";
import ClaimCreatorBtn from "../../features/claims/components/ClaimCreatorBtn.js";
import FollowButton from "../../features/api/components/FollowButton.js";
import SocialLinks from "./SocialLinks.js";
import VerifiedCreator from "./VerifiedCreator.js";
import { findFollowersCount } from "../../db/queries.js";
import Show from "./Show.js";
import { formatCountry } from "../../lib/utils.js";
import { formatDate } from "../../utils.js";
import CardCreatorCard from "./CardCreatorCard.js";
import FollowersCount from "./FollowersCount.js";
const CreatorCard = async ({
  creator,
  currentPath,
  title,
  user,
  featureDate,
  showFollowAndClaimButtons = true,
  shouldRefreshCreatorMessages = false,
  showHeader = true
}) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  const followerCount = await findFollowersCount(creator.id);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
    title && /* @__PURE__ */ jsx("div", { class: "text-sm py-0 text-on-surface font-bold mb-0", children: title }),
    /* @__PURE__ */ jsxs(Card, { children: [
      showHeader && /* @__PURE__ */ jsxs("div", { class: "px-3 py-2 flex items-center justify-between h-10", children: [
        /* @__PURE__ */ jsx(
          CardCreatorCard,
          {
            creator: creator ?? null,
            maxDisplayNameLength: 30
          }
        ),
        featureDate && /* @__PURE__ */ jsx(Card.Text, { children: formatDate(featureDate) })
      ] }),
      /* @__PURE__ */ jsx(
        Card.Image,
        {
          src: creator.coverUrl ?? "",
          alt: creator.displayName,
          href: `/creators/${creator.slug}`,
          aspectSquare: true,
          objectCover: true
        }
      ),
      /* @__PURE__ */ jsxs(Card.Body, { children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Card.Title, { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/creators/${creator.slug}`,
              class: "flex items-center gap-1",
              children: [
                creator.displayName,
                " ",
                /* @__PURE__ */ jsx(
                  VerifiedCreator,
                  {
                    creatorStatus: creator.status ?? "stub",
                    size: "xs"
                  }
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(Card.SubTitle, { children: /* @__PURE__ */ jsx("div", { class: "flex flex-wrap items-center gap-x-2 gap-y-1.5", children: (creator.city || creator.country) && /* @__PURE__ */ jsxs("span", { children: [
            creator.city ? `${creator.city}, ` : "",
            formatCountry(creator?.country ?? "")
          ] }) }) }),
          /* @__PURE__ */ jsx(FollowersCount, { count: followerCount })
        ] }),
        creator.tagline && /* @__PURE__ */ jsx(Card.Description, { children: creator.tagline }),
        /* @__PURE__ */ jsxs(Show, { when: showFollowAndClaimButtons, children: [
          /* @__PURE__ */ jsx(
            FollowButton,
            {
              creator,
              user,
              shouldRefreshCreatorMessages
            }
          ),
          creator.status === "stub" && /* @__PURE__ */ jsx(
            ClaimCreatorBtn,
            {
              creator,
              user,
              currentPath
            }
          ),
          /* @__PURE__ */ jsx(SocialLinks, { creator })
        ] })
      ] })
    ] })
  ] });
};
var CreatorCard_default = CreatorCard;
export {
  CreatorCard_default as default
};
