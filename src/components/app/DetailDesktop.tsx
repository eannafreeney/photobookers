import Card from "./Card";
import TagList from "./TagList";
import CreatorCard from "./CreatorCard";
import WishlistButton from "../api/WishlistButton";
import { AuthUser } from "../../../types";
import { BookWithGalleryImages } from "../../pages/BookDetailPage";
import Carousel from "./Carousel";
import AvailabilityBadge from "./AvailabilityBadge";
import Button from "./Button";
import PurchaseLink from "./PurchaseLink";
import { formatDate } from "../../utils";
import ShareButton from "./ShareButton";
import { canEditBook } from "../../lib/permissions";

type DetailProps = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  currentPath: string;
  user: AuthUser | null;
};

const DetailDesktop = ({
  galleryImages,
  book,
  currentPath,
  user,
}: DetailProps) => {
  return (
    <div class="flex flex-col gap-8">
      <div class="flex gap-16">
        <div class="flex flex-col gap-4 w-2/5">
          <Carousel images={galleryImages} />
          <div class="flex gap-2">
            <WishlistButton book={book} user={user} />
            <ShareButton />
          </div>
        </div>
        <div class="w-2/5">
          <div class="mb-4 flex flex-col gap-2">
            <div class="flex items-center gap-4">
              <h3 class="text-balance text-2xl font-semibold text-on-surface-strong">
                {book.title}
              </h3>
              {canEditBook(user, book) && (
                <a href={`/dashboard/admin/books/edit/${book.id}`}>
                  <Button variant="outline" color="secondary" width="sm">
                    Edit
                  </Button>
                </a>
              )}
            </div>
          </div>
          <div class="flex flex-col gap-4">
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
        <div class="w-1/5">
          <CreatorCard
            creator={book.artist}
            currentPath={currentPath}
            title="Artist"
            user={user}
          />
          <CreatorCard
            creator={book.publisher}
            currentPath={currentPath}
            title="Publisher"
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailDesktop;
