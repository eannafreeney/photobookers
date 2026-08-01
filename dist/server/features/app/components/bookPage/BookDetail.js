import { jsx } from "hono/jsx/jsx-runtime";
import BookDetailMobile from "./BookDetailMobile.js";
import BookDetailDesktop from "./BookDetailDesktop.js";
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
    BookDetailMobile,
    {
      galleryImages,
      book,
      currentPath,
      user,
      currentPage
    }
  ) : /* @__PURE__ */ jsx(
    BookDetailDesktop,
    {
      galleryImages,
      book,
      user,
      currentPath,
      currentPage
    }
  );
};
var BookDetail_default = BookDetail;
export {
  BookDetail_default as default,
  shouldTrackOutboundPurchase
};
