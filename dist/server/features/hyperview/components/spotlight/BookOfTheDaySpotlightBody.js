import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, View } from "../../../../lib/hxml-comps.js";
import { bookActionsStyles } from "../BookActions.js";
import { bookGalleryStyles } from "../BookGallery.js";
import { bookPageStyles } from "../BookPage.js";
import { newsletterCardStyles } from "../NewsletterCard.js";
import { secondaryButtonLinkStyles } from "../SecondaryButtonLink.js";
import SecondaryButtonLink from "../SecondaryButtonLink.js";
import { signInPromptStyles } from "../SignInPrompt.js";
import { spotlightCreatorRowStyles } from "./SpotlightCreatorRow.js";
import { spotlightHeaderStyles } from "./SpotlightHeader.js";
import BookActions from "../BookActions.js";
import BookGallery from "../BookGallery.js";
import NewsletterCard from "../NewsletterCard.js";
import SpotlightHeader from "./SpotlightHeader.js";
import SpotlightCreatorRow from "./SpotlightCreatorRow.js";
import { botdIndexPath, botdPath } from "../../../app/spotlightUrls.js";
import DiscoveryTags from "../DiscoveryTags.js";
import ExpandableBio from "./ExpandableBio.js";
const BookOfTheDaySpotlightBody = ({
  book,
  galleryImages,
  date,
  editorial,
  baseUrl,
  isFavorited,
  followingByCreatorId
}) => {
  const shareUrl = `${baseUrl}${botdPath(date)}`;
  const description = book.description?.trim() || editorial?.trim() || null;
  return /* @__PURE__ */ jsxs(View, { style: "spotlight-body", children: [
    /* @__PURE__ */ jsx(
      SpotlightHeader,
      {
        title: book.title,
        subtitle: book.artist?.displayName ?? ""
      }
    ),
    /* @__PURE__ */ jsx(BookGallery, { galleryImages }),
    /* @__PURE__ */ jsx(
      BookActions,
      {
        book,
        baseUrl,
        isFavorited,
        shareUrl,
        shareTitle: `Book of the Day \u2014 ${book.title}`,
        shareMessage: `Check out ${book.title} on Photobookers`
      }
    ),
    description ? /* @__PURE__ */ jsx(ExpandableBio, { bio: description, id: book.id }) : null,
    /* @__PURE__ */ jsx(NewsletterCard, { baseUrl }),
    book.artist ? /* @__PURE__ */ jsx(
      SpotlightCreatorRow,
      {
        creator: book.artist,
        role: "Artist",
        baseUrl,
        isFollowing: followingByCreatorId[book.artist.id] ?? false
      }
    ) : null,
    book.publisher ? /* @__PURE__ */ jsx(
      SpotlightCreatorRow,
      {
        creator: book.publisher,
        role: "Publisher",
        baseUrl,
        isFollowing: followingByCreatorId[book.publisher.id] ?? false
      }
    ) : null,
    /* @__PURE__ */ jsx(DiscoveryTags, { baseUrl, tags: book.tags ?? [] }),
    /* @__PURE__ */ jsx(
      SecondaryButtonLink,
      {
        label: "All Books of the Day \u2192",
        href: `${baseUrl}/hyperview${botdIndexPath()}`
      }
    )
  ] });
};
var BookOfTheDaySpotlightBody_default = BookOfTheDaySpotlightBody;
const bookOfTheDaySpotlightBodyStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 24,
      color: "#191613",
      marginBottom: 6
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "subtitle", fontSize: 15, color: "#45413a", marginBottom: 16 }),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-body", flexDirection: "column", gap: 12 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-body-text",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22
    }
  )
] });
const bookOfTheDaySpotlightPageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  spotlightHeaderStyles(),
  spotlightCreatorRowStyles(),
  bookOfTheDaySpotlightBodyStyles(),
  bookActionsStyles(),
  bookGalleryStyles(),
  bookPageStyles(),
  newsletterCardStyles(),
  secondaryButtonLinkStyles(),
  signInPromptStyles()
] });
export {
  bookOfTheDaySpotlightBodyStyles,
  bookOfTheDaySpotlightPageStyles,
  BookOfTheDaySpotlightBody_default as default
};
