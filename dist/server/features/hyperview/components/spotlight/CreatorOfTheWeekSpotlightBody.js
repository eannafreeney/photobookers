import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps.js";
import { bookCardStyles } from "../BookCard.js";
import { interviewCardStyles } from "../InterviewCard.js";
import { newsletterCardStyles } from "../NewsletterCard.js";
import { sectionHeaderStyles } from "../SectionHeader.js";
import { signInPromptStyles } from "../SignInPrompt.js";
import { spotlightHeaderStyles } from "./SpotlightHeader.js";
import BookCard from "../BookCard.js";
import NewsletterCard from "../NewsletterCard.js";
import SectionHeader from "../SectionHeader.js";
import { followButtonStyles } from "../FollowButton.js";
import ExpandableBio, { expandableBioStyles } from "./ExpandableBio.js";
import SpotlightHeader from "./SpotlightHeader.js";
import { formatCreatorLocation, toWeekString } from "../../../../lib/utils.js";
import CreatorActions, { creatorActionsStyles } from "./CreatorActions.js";
import InterviewSection, { interviewSectionStyles } from "./InterviewSection.js";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles
} from "../SecondaryButtonLink.js";
import { capitalize } from "../../../../utils.js";
import { cotwIndexPath } from "../../../app/spotlightUrls.js";
const CreatorOfTheWeekSpotlightBody = ({
  creator,
  weekStart,
  publishedInterview,
  books,
  baseUrl,
  isFollowing,
  favoritesByBookId,
  spotlightImage
}) => {
  const isArtist = creator.type === "artist";
  const bio = creator.bio?.trim() || null;
  const location = formatCreatorLocation(creator.city, creator.country);
  const subtitle = [location, toWeekString(weekStart)].filter(Boolean).join(" \xB7 ");
  const coverImage = spotlightImage ?? creator.coverUrl ?? creator.bannerUrl ?? null;
  const interviewUrl = publishedInterview ? `${baseUrl}/hyperview/interviews/view/${publishedInterview.creator.slug}` : null;
  const interviewTeaser = publishedInterview?.answers?.q1?.trim();
  return /* @__PURE__ */ jsxs(View, { style: "spotlight-body", children: [
    /* @__PURE__ */ jsx(SpotlightHeader, { title: creator.displayName, subtitle }),
    coverImage ? /* @__PURE__ */ jsx(
      Image,
      {
        source: coverImage,
        style: "spotlight-cover",
        "resize-mode": "cover"
      }
    ) : null,
    /* @__PURE__ */ jsx(
      CreatorActions,
      {
        creator,
        baseUrl,
        isFollowing,
        weekStart,
        coverImage
      }
    ),
    bio ? /* @__PURE__ */ jsx(ExpandableBio, { bio, id: creator.id }) : null,
    /* @__PURE__ */ jsxs(View, { style: "spotlight-profile-btn", children: [
      /* @__PURE__ */ jsxs(Text, { style: "spotlight-profile-btn-label", children: [
        "Visit ",
        creator.displayName,
        "'s profile"
      ] }),
      /* @__PURE__ */ jsx(
        Behavior,
        {
          href: `${baseUrl}/hyperview/creators/${creator.id}/tab/books`
        }
      )
    ] }),
    /* @__PURE__ */ jsx(NewsletterCard, { baseUrl }),
    publishedInterview && interviewUrl && /* @__PURE__ */ jsx(
      InterviewSection,
      {
        publishedInterview,
        interviewUrl,
        interviewTeaser,
        creator
      }
    ),
    books.length > 0 ? /* @__PURE__ */ jsxs(View, { children: [
      /* @__PURE__ */ jsx(SectionHeader, { title: `Books by ${creator.displayName}` }),
      /* @__PURE__ */ jsx(View, { style: "spotlight-books-grid", children: books.map((book) => /* @__PURE__ */ jsx(
        BookCard,
        {
          book,
          baseUrl,
          currentCreatorId: creator.id,
          isFavorited: favoritesByBookId[book.id] ?? false
        },
        book.id
      )) })
    ] }) : null,
    /* @__PURE__ */ jsx(
      SecondaryButtonLink,
      {
        label: `All ${capitalize(creator.type)}s of the Week \u2192`,
        href: `${baseUrl}/hyperview${cotwIndexPath(isArtist)}`
      }
    )
  ] });
};
var CreatorOfTheWeekSpotlightBody_default = CreatorOfTheWeekSpotlightBody;
const creatorOfTheWeekSpotlightBodyStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "spotlight-body", flexDirection: "column", gap: 16 }),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-cover", width: "100%", height: 280, borderRadius: 0 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-body-text",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-profile-btn",
      borderWidth: 1,
      borderColor: "#191613",
      borderRadius: 0,
      paddingTop: 12,
      paddingBottom: 12,
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-profile-btn-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-books-grid", gap: 12 })
] });
const creatorOfTheWeekSpotlightPageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  spotlightHeaderStyles(),
  creatorOfTheWeekSpotlightBodyStyles(),
  expandableBioStyles(),
  followButtonStyles(),
  creatorActionsStyles(),
  newsletterCardStyles(),
  interviewCardStyles(),
  bookCardStyles(),
  sectionHeaderStyles(),
  signInPromptStyles(),
  interviewSectionStyles(),
  secondaryButtonLinkStyles()
] });
export {
  creatorOfTheWeekSpotlightBodyStyles,
  creatorOfTheWeekSpotlightPageStyles,
  CreatorOfTheWeekSpotlightBody_default as default
};
