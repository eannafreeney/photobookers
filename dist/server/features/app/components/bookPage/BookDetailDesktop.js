import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import PurchaseLink from "../../../../components/app/PurchaseLink.js";
import ShareButton from "../../../api/components/ShareButton.js";
import TagList from "../../../../components/app/TagList.js";
import SaveToListButton from "../../../api/components/SaveToListButton.js";
import RelatedBooks from "../RelatedBooks.js";
import CommentsSection from "../CommentsSection.js";
import Divider from "../../../../components/Divider.js";
import BookCredits from "./BookCredits.js";
import BookPressSection from "./BookPressSection.js";
import { bookShareText, bookShareTitle } from "../../../../lib/share.js";
import { bookUrl } from "../../spotlightUrls.js";
import SpotlightCreator from "../SpotlightCreator.js";
import Card from "../../../../components/app/Card.js";
import AvailabilityBadge from "../../../../components/app/AvailabilityBadge.js";
import { shouldTrackOutboundPurchase } from "./BookDetail.js";
import { isFeatureEnabledForUser } from "../../../../lib/features.js";
const scrollPanelClass = "h-full overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const BookDetailDesktop = ({ galleryImages, book, user }) => {
  const hasArtist = !!book.artist;
  const hasPublisher = !!book.publisher;
  const creditCols = hasArtist && hasPublisher ? "grid-cols-2" : "grid-cols-1";
  const showPress = isFeatureEnabledForUser("bookPressLinks", user) && (book.pressLinks?.length ?? 0) > 0;
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
                truncateName: false,
                isVerified: book.artist?.status === "verified"
              }
            ) }),
            hasPublisher && /* @__PURE__ */ jsx("a", { href: `/creators/${book.publisher.slug}`, children: /* @__PURE__ */ jsx(
              SpotlightCreator,
              {
                creator: book.publisher,
                role: "Publisher",
                truncateName: false,
                isVerified: book.publisher?.status === "verified"
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-2 gap-4 py-4", children: [
          /* @__PURE__ */ jsx(SaveToListButton, { book, user, variant: "button" }),
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
          showPress ? /* @__PURE__ */ jsx(BookPressSection, { links: book.pressLinks }) : null,
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
var BookDetailDesktop_default = BookDetailDesktop;
export {
  BookDetailDesktop_default as default
};
