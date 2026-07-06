import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import FollowButton from "../../api/components/FollowButton.js";
import ShareButton from "../../api/components/ShareButton.js";
import BooksGrid from "./BooksGrid.js";
import CreatorCard from "../../../components/app/CreatorCard.js";
import CreatorsGrid from "./CreatorsGrid.js";
import Tabs from "../../../components/app/Tabs.js";
import CreatorMessages from "./CreatorMessages.js";
import CreatorOwnerPostCta from "./CreatorOwnerPostCta.js";
import CreatorPageBanner from "./CreatorPageBanner.js";
import { creatorUrl } from "../spotlightUrls.js";
import { creatorShareText } from "../../../lib/share.js";
import { formatCountry } from "../../../lib/utils.js";
import ExpandableDescription from "./ExpandableDescription.js";
import UpcomingFairsSection from "../fairs/components/UpcomingFairsSection.js";
import SocialLinks from "../../../components/app/SocialLinks.js";
import ClaimCreatorBtn from "../../claims/components/ClaimCreatorBtn.js";
import FollowersCount from "../../../components/app/FollowersCount.js";
import VerifiedCreator from "../../../components/app/VerifiedCreator.js";
import { findFollowersCount } from "../../../db/queries.js";
const CreatorDetail = ({
  creator,
  user,
  currentPath,
  result,
  creatorsCurrentPage,
  isMobile,
  postCount,
  upcomingFairs
}) => {
  const showCreatorsTab = result.relatedCreators.creators.length > 0;
  const showFairsTab = upcomingFairs.length > 0;
  const isOwner = user?.creator?.id === creator.id;
  const postsTabLabel = postCount > 0 ? `Posts (${postCount})` : "Posts";
  return isMobile ? /* @__PURE__ */ jsx(
    CreatorDetailMobile,
    {
      creator,
      user,
      currentPath,
      showCreatorsTab,
      showFairsTab,
      result,
      creatorsCurrentPage,
      upcomingFairs,
      isOwner,
      postCount,
      postsTabLabel
    }
  ) : /* @__PURE__ */ jsx(
    CreatorDetailDesktop,
    {
      creator,
      user,
      currentPath,
      showCreatorsTab,
      showFairsTab,
      result,
      creatorsCurrentPage,
      upcomingFairs,
      isOwner,
      postCount,
      postsTabLabel
    }
  );
};
var CreatorDetail_default = CreatorDetail;
const CreatorBio = async ({
  creator,
  maxWords = 75
}) => {
  const bio = creator.bio?.trim() || null;
  if (!bio)
    return /* @__PURE__ */ jsx("div", { class: "flex justify-center", children: /* @__PURE__ */ jsx(CreatorBioMeta, { creator }) });
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx(ExpandableDescription, { text: bio, maxWords }),
    /* @__PURE__ */ jsx(CreatorBioMeta, { creator })
  ] });
};
const CreatorBioSection = async ({
  creator,
  maxWords = 75
}) => {
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
const CreatorAvatar = ({
  creator,
  class: className = "size-16"
}) => /* @__PURE__ */ jsxs("div", { class: "relative shrink-0", children: [
  creator.coverUrl ? /* @__PURE__ */ jsx(
    "img",
    {
      src: creator.coverUrl,
      alt: creator.displayName,
      class: `${className} rounded-full border border-outline object-cover`
    }
  ) : /* @__PURE__ */ jsx(
    "span",
    {
      class: `flex ${className} items-center justify-center rounded-full border border-outline bg-surface-alt text-lg font-semibold text-on-surface`,
      "aria-hidden": "true",
      children: creator.displayName.charAt(0)
    }
  ),
  /* @__PURE__ */ jsx("div", { class: "absolute -top-0.5 -right-0.5", children: /* @__PURE__ */ jsx(VerifiedCreator, { creatorStatus: creator.status ?? "stub", size: "xs" }) })
] });
const CreatorDetailMobile = ({
  creator,
  user,
  currentPath,
  result,
  showCreatorsTab,
  showFairsTab,
  creatorsCurrentPage,
  isOwner,
  postCount,
  postsTabLabel,
  upcomingFairs
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    CreatorPageBanner,
    {
      bannerUrl: creator.bannerUrl,
      displayName: creator.displayName
    }
  ),
  /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(CreatorAvatar, { creator, class: "size-10" }),
      /* @__PURE__ */ jsx("h1", { class: "text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-6xl", children: creator.displayName })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsx(FollowButton, { creator, variant: "mobile", user }),
      /* @__PURE__ */ jsx(
        ShareButton,
        {
          title: creator.displayName,
          text: creatorShareText(creator),
          url: creatorUrl(creator.slug)
        }
      )
    ] }),
    isOwner && /* @__PURE__ */ jsx(CreatorOwnerPostCta, { creatorSlug: creator.slug, postCount }),
    /* @__PURE__ */ jsxs(Tabs, { defaultTab: "books", children: [
      /* @__PURE__ */ jsxs(Tabs.LinkContainer, { children: [
        /* @__PURE__ */ jsx(Tabs.Link, { tabId: "books", children: "Books" }),
        /* @__PURE__ */ jsx(Tabs.Link, { tabId: "posts", children: postsTabLabel }),
        showCreatorsTab && /* @__PURE__ */ jsx(Tabs.Link, { tabId: "creators", children: creator.type === "publisher" ? "Artists" : "Publishers" }),
        showFairsTab && /* @__PURE__ */ jsx(Tabs.Link, { tabId: "fairs", children: "Fairs" }),
        /* @__PURE__ */ jsx(Tabs.Link, { tabId: "about", children: "About" })
      ] }),
      /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "books", children: /* @__PURE__ */ jsx(
        BooksGrid,
        {
          isMobile: true,
          user,
          currentPath,
          result,
          currentCreatorId: creator.id,
          noResultsMessage: "No books found"
        }
      ) }),
      /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "posts", children: /* @__PURE__ */ jsx(CreatorMessages, { creatorSlug: creator.slug, user }) }),
      /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "creators", children: /* @__PURE__ */ jsx(
        CreatorsGrid,
        {
          isMobile: true,
          user,
          currentPage: creatorsCurrentPage,
          creatorId: creator.id,
          creatorType: creator.type,
          currentPath,
          pageParam: "creatorsPage"
        }
      ) }),
      /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "fairs", children: /* @__PURE__ */ jsx(UpcomingFairsSection, { fairs: upcomingFairs }) }),
      /* @__PURE__ */ jsxs(Tabs.Panel, { tabId: "about", children: [
        /* @__PURE__ */ jsx(
          CreatorCard,
          {
            creator,
            currentPath,
            user,
            shouldRefreshCreatorMessages: true,
            showHeader: false
          }
        ),
        /* @__PURE__ */ jsx(
          CreatorsGrid,
          {
            user,
            currentPage: creatorsCurrentPage,
            creatorId: creator.id,
            creatorType: creator.type,
            currentPath,
            title: "You may also like...",
            pageParam: "creatorsPage"
          }
        )
      ] })
    ] })
  ] })
] });
const CreatorDetailDesktop = ({
  creator,
  user,
  currentPath,
  creatorsCurrentPage,
  showCreatorsTab,
  showFairsTab,
  result,
  upcomingFairs,
  isOwner,
  postCount,
  postsTabLabel
}) => {
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
        /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(
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
      /* @__PURE__ */ jsxs(Tabs, { defaultTab: "books", children: [
        /* @__PURE__ */ jsxs(Tabs.LinkContainer, { align: "left", children: [
          /* @__PURE__ */ jsx(Tabs.Link, { tabId: "books", children: "Books" }),
          /* @__PURE__ */ jsx(Tabs.Link, { tabId: "posts", children: postsTabLabel }),
          showCreatorsTab && /* @__PURE__ */ jsx(Tabs.Link, { tabId: "creators", children: creator.type === "publisher" ? "Artists" : "Publishers" }),
          showFairsTab && /* @__PURE__ */ jsx(Tabs.Link, { tabId: "fairs", children: "Fairs" })
        ] }),
        /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "books", children: /* @__PURE__ */ jsx(
          BooksGrid,
          {
            isInfiniteScroll: true,
            user,
            currentPath,
            result,
            currentCreatorId: creator.id,
            noResultsMessage: "No books found"
          }
        ) }),
        /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "posts", children: /* @__PURE__ */ jsx(CreatorMessages, { creatorSlug: creator.slug, user }) }),
        /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "creators", children: /* @__PURE__ */ jsx(
          CreatorsGrid,
          {
            user,
            creatorId: creator.id,
            creatorType: creator.type,
            currentPath,
            currentPage: creatorsCurrentPage,
            pageParam: "creatorsPage"
          }
        ) }),
        /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "fairs", children: /* @__PURE__ */ jsx(UpcomingFairsSection, { fairs: upcomingFairs }) })
      ] })
    ] })
  ] });
};
const CreatorBioMeta = async ({
  creator,
  variant = "inline",
  align = "left",
  followerCount: followerCountProp
}) => {
  const followerCount = followerCountProp ?? await findFollowersCount(creator.id);
  const hasLocation = !!(creator.city || creator.country);
  const hasFollowers = followerCount > 10;
  const hasSocials = !!(creator.website || creator.facebook || creator.instagram || creator.twitter);
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
export {
  CreatorDetail_default as default
};
