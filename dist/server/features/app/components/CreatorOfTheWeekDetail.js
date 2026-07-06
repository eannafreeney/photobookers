import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import BookCard from "../../../components/app/BookCard.js";
import ShareButton from "../../api/components/ShareButton.js";
import SpotlightCreatorLink from "./SpotlightCreatorLink.js";
import ExpandableDescription from "./ExpandableDescription.js";
import InterviewPreviewSection from "./InterviewPreviewSection.js";
import NewsletterCard from "./NewsletterCard.js";
import { formatCreatorLocation } from "../../../lib/utils.js";
import FeaturedPageHeader from "./FeaturedPageHeader.js";
import { capitalize } from "../../../utils.js";
import { aotwUrl, potwUrl } from "../spotlightUrls.js";
import FollowButton from "../../api/components/FollowButton.js";
import {
  creatorOfTheWeekShareText,
  creatorOfTheWeekShareTitle
} from "../../../lib/share.js";
const CreatorOfTheWeekDetail = async ({
  creator,
  user,
  weekStart,
  publishedInterview,
  books
}) => {
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const bio = creator.bio?.trim() || null;
  const isSingleBook = books.length === 1;
  const location = formatCreatorLocation(creator.city, creator.country);
  const spotlightUrl = creator.type === "artist" ? aotwUrl(weekStart) : potwUrl(weekStart);
  return /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full flex-col gap-6  md:max-w-xl", children: [
    /* @__PURE__ */ jsx(
      FeaturedPageHeader,
      {
        title,
        name: creator.displayName,
        weekStart,
        location
      }
    ),
    creator.coverUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: creator.coverUrl,
        alt: creator.displayName,
        class: "w-full rounded-radius object-cover"
      }
    ) : null,
    /* @__PURE__ */ jsxs("div", { class: "flex gap-2 justify-center", children: [
      /* @__PURE__ */ jsx(FollowButton, { creator, user }),
      /* @__PURE__ */ jsx(
        ShareButton,
        {
          title: creatorOfTheWeekShareTitle(creator, role),
          text: creatorOfTheWeekShareText(creator, role),
          url: spotlightUrl
        }
      )
    ] }),
    bio ? /* @__PURE__ */ jsx(ExpandableDescription, { text: bio }) : null,
    /* @__PURE__ */ jsx(NewsletterCard, {}),
    publishedInterview ? /* @__PURE__ */ jsx(
      InterviewPreviewSection,
      {
        interview: publishedInterview,
        widthClass: "w-full"
      }
    ) : null,
    /* @__PURE__ */ jsx(SpotlightCreatorLink, { creator, role }),
    books.length > 0 ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxs(SectionTitle, { children: [
        "Books by ",
        creator.displayName
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          class: isSingleBook ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4",
          children: books.map((book) => /* @__PURE__ */ jsx(
            BookCard,
            {
              book,
              user,
              currentCreatorId: creator.id,
              className: "w-full min-w-0 max-w-none"
            },
            book.id
          ))
        }
      )
    ] }) : null
  ] });
};
var CreatorOfTheWeekDetail_default = CreatorOfTheWeekDetail;
export {
  CreatorOfTheWeekDetail_default as default
};
