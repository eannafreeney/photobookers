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
import Button from "./Button";
import { canEditBook } from "../../lib/permissions";

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
        <h3 class="text-balance text-xl font-semibold text-on-surface-strong">
          {book.title}
        </h3>
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
      {canEditBook(user, book) && (
        <a href={`/dashboard/admin/books/edit/${book.id}`}>
          <Button variant="outline" color="secondary" width="sm">
            Edit
          </Button>
        </a>
      )}
      <div class="flex flex-col sm:items-center gap-2">
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

export default DetailMobile;
