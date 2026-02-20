import CarouselMobile from "./CarouselMobile";
import Card from "./Card";
import TagList from "./TagList";
import { formatDate } from "../../utils";
import CreatorCard from "./CreatorCard";
import WishlistButton from "../api/WishlistButton";
import { AuthUser } from "../../../types";
import { BookWithGalleryImages } from "../../pages/BookDetailPage";
import CardCreatorCard from "./CardCreatorCard";
import AvailabilityBadge from "./AvailabilityBadge";
import PurchaseLink from "./PurchaseLink";
import ShareButton from "./ShareButton";

type DetailProps = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  currentPath: string;
  user: AuthUser | null;
  orientation: "portrait" | "landscape";
};

const DetailMobile = ({
  galleryImages,
  book,
  currentPath,
  user,
  orientation,
}: DetailProps) => {
  return (
    <div class="flex flex-col gap-4 ">
      <CarouselMobile images={galleryImages} />
      <div class="flex flex-col gap-2">
        <Card.Title>{book.title}</Card.Title>
        {book.artist && <CardCreatorCard creatorType="artist" book={book} />}
        {book.publisher && (
          <CardCreatorCard creatorType="publisher" book={book} />
        )}
      </div>
      <div class="flex items-center gap-2">
        <WishlistButton book={book} user={user} />
        <ShareButton />
      </div>
      {book.releaseDate && (
        <Card.Description>{formatDate(book.releaseDate)}</Card.Description>
      )}
      {book.description && (
        <Card.Description>{book.description}</Card.Description>
      )}
      <AvailabilityBadge availabilityStatus={book.availabilityStatus} />
      <PurchaseLink purchaseLink={book.purchaseLink} />
      <TagList tags={book.tags ?? []} />
      <CreatorCard
        creator={book.artist}
        currentPath={currentPath}
        orientation={orientation}
        user={user}
      />
      <CreatorCard
        creator={book.publisher}
        currentPath={currentPath}
        title="Publisher"
        orientation={orientation}
        user={user}
      />
    </div>
  );
};

export default DetailMobile;
