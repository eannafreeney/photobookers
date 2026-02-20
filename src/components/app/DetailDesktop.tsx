import Card from "./Card";
import TagList from "./TagList";
import CreatorCard from "./CreatorCard";
import WishlistButton from "../api/WishlistButton";
import { AuthUser } from "../../../types";
import { BookWithGalleryImages } from "../../pages/BookDetailPage";
import PreviewBanner from "./PreviewBanner";
import Carousel from "./Carousel";
import Link from "./Link";
import CardCreatorCard from "./CardCreatorCard";
import AvailabilityBadge from "./AvailabilityBadge";
import Button from "./Button";
import PurchaseLink from "./PurchaseLink";
import { formatDate } from "../../utils";
import ShareButton from "./ShareButton";

type DetailProps = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  currentPath: string;
  user: AuthUser | null;
  orientation: "portrait" | "landscape";
};

const DetailDesktop = ({
  galleryImages,
  book,
  currentPath,
  user,
  orientation,
}: DetailProps) => {
  return (
    <div class="flex flex-col gap-8">
      <div class="flex gap-16">
        <div class="w-1/2">
          <Carousel images={galleryImages} />
        </div>
        <div class="w-1/2">
          <div class="mb-4 flex flex-col gap-2">
            <Card.Title>{book.title}</Card.Title>
            {book.artist && (
              <CardCreatorCard creatorType="artist" book={book} />
            )}
            {/* {book.publisher && (
              <CardCreatorCard creatorType="publisher" book={book} />
            )} */}
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex gap-2">
              <WishlistButton book={book} user={user} />
              <ShareButton />
            </div>
            {book.releaseDate && (
              <Card.Text>{formatDate(book.releaseDate)}</Card.Text>
            )}
            {book.description && (
              <Card.Description>{book.description}</Card.Description>
            )}
            <AvailabilityBadge availabilityStatus={book.availabilityStatus} />
            <TagList tags={book.tags ?? []} />
            <PurchaseLink purchaseLink={book.purchaseLink} />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
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
    </div>
  );
};

export default DetailDesktop;
