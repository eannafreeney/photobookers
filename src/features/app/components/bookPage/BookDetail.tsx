import { AuthUser } from "../../../../../types";
import { BookWithGalleryImages } from "../../types";
import { Creator } from "../../../../db/schema";
import BookDetailMobile from "./BookDetailMobile";
import BookDetailDesktop from "./BookDetailDesktop";

export type BookDetailProps = {
  isMobile?: boolean;
  galleryImages: string[];
  book: BookWithGalleryImages;
  creator?: Creator | null;
  currentPath: string;
  user: AuthUser | null;
  currentPage: number;
  spotlightKicker?: string | null;
};

export const shouldTrackOutboundPurchase = (book: BookWithGalleryImages) =>
  book.publicationStatus === "published" && book.approvalStatus === "approved";

const BookDetail = ({
  isMobile,
  galleryImages,
  book,
  currentPath,
  user,
  currentPage,
  spotlightKicker,
}: BookDetailProps) => {
  return isMobile ? (
    <BookDetailMobile
      galleryImages={galleryImages}
      book={book}
      currentPath={currentPath}
      user={user}
      currentPage={currentPage}
      spotlightKicker={spotlightKicker}
    />
  ) : (
    <BookDetailDesktop
      galleryImages={galleryImages}
      book={book}
      user={user}
      currentPath={currentPath}
      currentPage={currentPage}
      spotlightKicker={spotlightKicker}
    />
  );
};

export default BookDetail;
