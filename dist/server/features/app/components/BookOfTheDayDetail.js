import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import CarouselMobile from "../../../components/app/CarouselMobile.js";
import HorizontalScrollGallery from "../../../components/app/HorizontalScrollGallery.js";
import SpotlightCreatorLink from "./SpotlightCreatorLink.js";
import PageBleed from "../../../components/layouts/PageBleed.js";
import ExpandableDescription from "./ExpandableDescription.js";
import NewsletterCard from "./NewsletterCard.js";
import ShareButton from "../../api/components/ShareButton.js";
import { botdUrl } from "../spotlightUrls.js";
import FeaturedPageHeader from "./FeaturedPageHeader.js";
import FavoriteButton from "../../api/components/FavouriteButton.js";
import {
  bookOfTheDayShareText,
  bookOfTheDayShareTitle
} from "../../../lib/share.js";
import { getBookComments } from "../services.js";
import CommentsList from "./CommentsList.js";
const BookOfTheDayDetail = async ({
  book,
  galleryImages,
  isMobile,
  user,
  date
}) => {
  const [err, comments] = await getBookComments(book.id);
  if (err) return /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: err.reason });
  return /* @__PURE__ */ jsxs("div", { class: "flex w-full min-w-0 flex-col gap-4", children: [
    /* @__PURE__ */ jsx(
      FeaturedPageHeader,
      {
        title: "Book of the Day",
        name: book.title,
        date
      }
    ),
    galleryImages.length > 0 ? isMobile ? /* @__PURE__ */ jsx("div", { class: "min-w-0", children: /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsx(CarouselMobile, { images: galleryImages }) }) }) : /* @__PURE__ */ jsx("div", { class: "min-w-0", children: /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsx(
      HorizontalScrollGallery,
      {
        images: galleryImages,
        imageAlt: book.title
      }
    ) }) }) : null,
    /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full flex-col gap-8 md:max-w-xl", children: [
      /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(FavoriteButton, { book, user }),
        /* @__PURE__ */ jsx(
          ShareButton,
          {
            title: bookOfTheDayShareTitle(book),
            text: bookOfTheDayShareText(book),
            url: botdUrl(date)
          }
        )
      ] }),
      book.description?.trim() ? /* @__PURE__ */ jsx(ExpandableDescription, { text: book.description.trim() }) : null,
      /* @__PURE__ */ jsx(NewsletterCard, {}),
      /* @__PURE__ */ jsx(SpotlightCreatorLink, { creator: book.artist, role: "Artist" }),
      book.publisher && /* @__PURE__ */ jsx(SpotlightCreatorLink, { creator: book.publisher, role: "Publisher" }),
      comments.length > 0 && /* @__PURE__ */ jsx(CommentsList, { bookId: book.id, comments, user })
    ] })
  ] });
};
var BookOfTheDayDetail_default = BookOfTheDayDetail;
export {
  BookOfTheDayDetail_default as default
};
