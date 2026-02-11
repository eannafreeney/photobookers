import CarouselMobile from "./CarouselMobile";
import Card from "./Card";
import TagList from "./TagList";
import { formatDate } from "../../utils";
import CreatorCard from "./CreatorCard";
import WishlistButton from "../api/WishlistButton";
import { AuthUser } from "../../../types";
import { BookWithGalleryImages } from "../../pages/BookDetailPage";
import PreviewBanner from "./PreviewBanner";
import CardCreatorCard from "./CardCreatorCard";
import AvailabilityBadge from "./AvailabilityBadge";
import PurchaseLink from "./PurchaseLink";

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
        {book.publisher && (
          <CardCreatorCard creatorType="publisher" book={book} />
        )}
      </div>
      <WishlistButton book={book} user={user} />
      <Card.Description>
        {book.releaseDate && formatDate(book.releaseDate)}
      </Card.Description>
      <Card.Description>{book.description ?? ""}</Card.Description>
      <AvailabilityBadge availabilityStatus={book.availabilityStatus} />
      <Card.Description>{book.specs ?? ""}</Card.Description>
      {book.publisher && <CardCreatorCard creatorType="artist" book={book} />}
      <TagList tags={book.tags ?? []} />
      <PurchaseLink purchaseLink={book.purchaseLink} />
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
