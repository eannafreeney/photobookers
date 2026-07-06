import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import AvailabilityBadge from "../../../components/app/AvailabilityBadge.js";
import Card from "../../../components/app/Card.js";
import CarouselMobile from "../../../components/app/CarouselMobile.js";
import CreatorCard from "../../../components/app/CreatorCard.js";
import PurchaseLink from "../../../components/app/PurchaseLink.js";
import ShareButton from "../../api/components/ShareButton.js";
import TagList from "../../../components/app/TagList.js";
import FavouriteButton from "../../api/components/FavouriteButton.js";
import RelatedBooks from "../components/RelatedBooks.js";
import CommentsSection from "../components/CommentsSection.js";
import Divider from "../../../components/Divider.js";
import BookCredits from "./BookCredits.js";
import PageBleed from "../../../components/layouts/PageBleed.js";
import Tabs from "../../../components/app/Tabs.js";
import Show from "../../../components/app/Show.js";
import BookGridWrapper from "./BookGridWrapper.js";
import { bookShareText, bookShareTitle } from "../../../lib/share.js";
import { bookUrl } from "../spotlightUrls.js";
import MobileHeader from "./MobileHeader.js";
import SpotlightCreator from "./SpotlightCreator.js";
const shouldTrackOutboundPurchase = (book) => book.publicationStatus === "published" && book.approvalStatus === "approved";
const BookDetail = ({
  isMobile,
  galleryImages,
  book,
  currentPath,
  user,
  currentPage
}) => {
  return isMobile ? /* @__PURE__ */ jsx(
    DetailMobile,
    {
      galleryImages,
      book,
      currentPath,
      user,
      currentPage
    }
  ) : /* @__PURE__ */ jsx(DetailDesktop, { galleryImages, book, user });
};
var BookDetail_default = BookDetail;
const scrollPanelClass = "h-full overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const DetailDesktop = ({ galleryImages, book, user }) => {
  const hasArtist = !!book.artist;
  const hasPublisher = !!book.publisher;
  const creditCols = hasArtist && hasPublisher ? "grid-cols-2" : "grid-cols-1";
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex gap-8 h-[calc(100vh-8rem)]", children: [
      /* @__PURE__ */ jsx("div", { class: `w-1/2 ${scrollPanelClass}`, children: /* @__PURE__ */ jsx("div", { class: "flex flex-col", children: galleryImages.map((image, index) => /* @__PURE__ */ jsx(
        "img",
        {
          src: image,
          alt: `${book.title} image ${index + 1}`,
          loading: "lazy"
        }
      )) }) }),
      /* @__PURE__ */ jsx("div", { class: `w-1/2 ${scrollPanelClass}`, children: /* @__PURE__ */ jsxs("div", { class: "mb-4 flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 border-b-2 border-on-surface-strong pb-4", children: [
          /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Photobook" }),
          /* @__PURE__ */ jsx("h1", { class: "text-balance font-display text-3xl xl:text-5xl font-medium leading-tight text-on-surface-strong", children: book.title }),
          (hasArtist || hasPublisher) && /* @__PURE__ */ jsxs("div", { class: `grid ${creditCols} items-center gap-4`, children: [
            hasArtist && /* @__PURE__ */ jsx("a", { href: `/creators/${book.artist.slug}`, children: /* @__PURE__ */ jsx(
              SpotlightCreator,
              {
                creator: book.artist,
                role: "Artist",
                truncateName: false
              }
            ) }),
            hasPublisher && /* @__PURE__ */ jsx("a", { href: `/creators/${book.publisher.slug}`, children: /* @__PURE__ */ jsx(
              SpotlightCreator,
              {
                creator: book.publisher,
                role: "Publisher",
                truncateName: false
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-2 gap-4 py-4", children: [
          /* @__PURE__ */ jsx(FavouriteButton, { book, user }),
          /* @__PURE__ */ jsx(
            ShareButton,
            {
              title: bookShareTitle(book),
              text: bookShareText(book),
              url: bookUrl(book.slug)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
          book.description && /* @__PURE__ */ jsx(Card.Description, { children: book.description }),
          /* @__PURE__ */ jsx(AvailabilityBadge, { availabilityStatus: book.availabilityStatus }),
          /* @__PURE__ */ jsx(TagList, { tags: book.tags ?? [] }),
          /* @__PURE__ */ jsx(
            PurchaseLink,
            {
              bookSlug: book.slug,
              purchaseLink: book.purchaseLink,
              trackOutbound: shouldTrackOutboundPurchase(book)
            }
          ),
          /* @__PURE__ */ jsx(
            CommentsSection,
            {
              bookId: book.id,
              user,
              bookSlug: book.slug
            }
          ),
          /* @__PURE__ */ jsx(BookCredits, { releaseDate: book.releaseDate })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(RelatedBooks, { book, user })
  ] });
};
const DetailMobile = ({
  galleryImages,
  book,
  currentPath,
  user,
  currentPage
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(MobileHeader, { kicker: book.artist?.displayName ?? "", title: book.title, children: /* @__PURE__ */ jsxs("div", { class: "flex justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsx(FavouriteButton, { book, user }),
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
export {
  BookDetail_default as default
};
