import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import AvailabilityBadge from "../../../../components/app/AvailabilityBadge.js";
import Card from "../../../../components/app/Card.js";
import CarouselMobile from "../../../../components/app/CarouselMobile.js";
import CreatorCard from "../../../../components/app/CreatorCard.js";
import PurchaseLink from "../../../../components/app/PurchaseLink.js";
import ShareButton from "../../../api/components/ShareButton.js";
import TagList from "../../../../components/app/TagList.js";
import SaveToListButton from "../../../api/components/SaveToListButton.js";
import CommentsSection from "../CommentsSection.js";
import Divider from "../../../../components/Divider.js";
import BookCredits from "./BookCredits.js";
import BookPressSection from "./BookPressSection.js";
import PageBleed from "../../../../components/layouts/PageBleed.js";
import Tabs from "../../../../components/app/Tabs.js";
import Show from "../../../../components/app/Show.js";
import BookGridWrapper from "../BookGridWrapper.js";
import { bookShareText, bookShareTitle } from "../../../../lib/share.js";
import { bookUrl } from "../../spotlightUrls.js";
import MobileHeader from "../MobileHeader.js";
import { shouldTrackOutboundPurchase } from "./BookDetail.js";
import { isFeatureEnabledForUser } from "../../../../lib/features.js";
const BookDetailMobile = ({
  galleryImages,
  book,
  currentPath,
  user,
  currentPage
}) => {
  const showPress = isFeatureEnabledForUser("bookPressLinks", user) && (book.pressLinks?.length ?? 0) > 0;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(MobileHeader, { kicker: book.artist?.displayName ?? "", title: book.title, children: /* @__PURE__ */ jsxs("div", { class: "flex justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsx(SaveToListButton, { book, user, variant: "button" }),
      /* @__PURE__ */ jsx(
        ShareButton,
        {
          title: bookShareTitle(book),
          text: bookShareText(book),
          url: bookUrl(book.slug)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs(Tabs, { defaultTab: "books", children: [
      /* @__PURE__ */ jsxs(Tabs.LinkContainer, { children: [
        /* @__PURE__ */ jsx(Tabs.Link, { tabId: "books", children: "Book" }),
        /* @__PURE__ */ jsx(Tabs.Link, { tabId: "comments", children: "Comments" }),
        /* @__PURE__ */ jsx(Tabs.Link, { tabId: "artist", children: "Artist" }),
        /* @__PURE__ */ jsx(Show, { when: !!book.publisher, children: /* @__PURE__ */ jsx(Tabs.Link, { tabId: "publisher", children: "Publisher" }) })
      ] }),
      /* @__PURE__ */ jsxs(Tabs.Panel, { tabId: "books", children: [
        /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsx(CarouselMobile, { images: galleryImages }) }),
        book.description && /* @__PURE__ */ jsx(Card.Description, { children: book.description }),
        /* @__PURE__ */ jsx(AvailabilityBadge, { availabilityStatus: book.availabilityStatus }),
        /* @__PURE__ */ jsx(
          PurchaseLink,
          {
            bookSlug: book.slug,
            purchaseLink: book.purchaseLink,
            trackOutbound: shouldTrackOutboundPurchase(book)
          }
        ),
        showPress ? /* @__PURE__ */ jsx(BookPressSection, { links: book.pressLinks }) : null,
        /* @__PURE__ */ jsx(BookCredits, { releaseDate: book.releaseDate }),
        /* @__PURE__ */ jsx(TagList, { tags: book.tags ?? [] })
      ] }),
      /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "comments", children: /* @__PURE__ */ jsx(
        CommentsSection,
        {
          bookId: book.id,
          user,
          bookSlug: book.slug,
          isMobile: true
        }
      ) }),
      /* @__PURE__ */ jsxs(Tabs.Panel, { tabId: "artist", children: [
        /* @__PURE__ */ jsx(
          CreatorCard,
          {
            creator: book.artist,
            currentPath,
            user,
            showHeader: false
          }
        ),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(
          BookGridWrapper,
          {
            bookSlug: book.slug,
            currentPage,
            creator: book?.artist ?? null,
            currentPath,
            user
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Tabs.Panel, { tabId: "publisher", children: [
        /* @__PURE__ */ jsx(
          CreatorCard,
          {
            creator: book.publisher,
            currentPath,
            user,
            showHeader: false
          }
        ),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(
          BookGridWrapper,
          {
            isMobile: true,
            bookSlug: book.slug,
            currentPage,
            creator: book?.publisher ?? null,
            currentPath,
            user
          }
        )
      ] })
    ] })
  ] });
};
var BookDetailMobile_default = BookDetailMobile;
export {
  BookDetailMobile_default as default
};
