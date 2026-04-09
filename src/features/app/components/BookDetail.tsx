import { AuthUser } from "../../../../types";
import AvailabilityBadge from "../../../components/app/AvailabilityBadge";
import Card from "../../../components/app/Card";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import CarouselMobile from "../../../components/app/CarouselMobile";
import CreatorCard from "../../../components/app/CreatorCard";
import PurchaseLink from "../../../components/app/PurchaseLink";
import ShareButton from "../../api/components/ShareButton";
import TagList from "../../../components/app/TagList";
import { formatDate } from "../../../utils";
import WishlistButton from "../../api/components/WishlistButton";
import { BookWithGalleryImages } from "../types";
import CollectButton from "../../api/components/CollectButton";
import { Creator } from "../../../db/schema";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import RelatedBooks from "../components/RelatedBooks";
import CommentsSection from "../components/CommentsSection";
import LikeButton from "../../api/components/LikeButton";
import Divider from "../../../components/Divider";
import BookNavTabs from "./BookNavTabs";
import BookCredits from "./BookCredits";

type BookDetailProps = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  currentPath: string;
  user: AuthUser | null;
  isMobile?: boolean;
  creator?: Creator | null;
};

const BookDetail = ({
  isMobile,
  galleryImages,
  book,
  currentPath,
  user,
}: BookDetailProps) => {
  return isMobile ? (
    <DetailMobile
      galleryImages={galleryImages}
      book={book}
      currentPath={currentPath}
      user={user}
      isMobile={isMobile}
      creator={book.artist}
    />
  ) : (
    <DetailDesktop
      galleryImages={galleryImages}
      book={book}
      currentPath={currentPath}
      user={user}
    />
  );
};

export default BookDetail;

const DetailDesktop = ({
  galleryImages,
  book,
  currentPath,
  user,
}: BookDetailProps) => {
  return (
    <div class="flex flex-col gap-8">
      <div class="flex gap-8 h-[calc(100vh-8rem)]">
        <div class="w-2/5 h-full overflow-y-auto pr-2">
          <div class="flex flex-col">
            {galleryImages.map((image, index) => (
              <img
                src={image}
                alt={`${book.title} image ${index + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div class="w-2/5 h-full overflow-y-auto pr-2">
          <div class="mb-4 flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <div class="text-balance text-lg font-semibold text-on-surface-strong">
                {book.title}
              </div>
              <div class="text-balance text-lg font-normal text-on-surface-strong">
                {book.artist?.displayName}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <LikeButton isCircleButton book={book} user={user} />
              <CollectButton isCircleButton book={book} user={user} />
              <WishlistButton isCircleButton book={book} user={user} />
              <ShareButton isCircleButton />
            </div>
            <div class="flex flex-col gap-4">
              {book.description && (
                <Card.Description>{book.description}</Card.Description>
              )}
              <AvailabilityBadge availabilityStatus={book.availabilityStatus} />
              <TagList tags={book.tags ?? []} />
              <PurchaseLink purchaseLink={book.purchaseLink} />
              <CommentsSection
                bookId={book.id}
                user={user}
                bookSlug={book.slug}
              />
              <BookCredits releaseDate={book.releaseDate} />
            </div>
          </div>
        </div>
        <div class="w-1/5 h-full overflow-y-auto flex flex-col gap-4">
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
      <Divider />
      <RelatedBooks book={book} user={user} />
    </div>
  );
};

const DetailMobile = ({
  galleryImages,
  book,
  currentPath,
  user,
  creator,
}: BookDetailProps) => {
  return (
    <div class="flex flex-col gap-4">
      {creator && <MobileCreatorCard creator={creator} user={user} />}
      <BookNavTabs
        bookSlug={book.slug}
        currentPath={currentPath}
        hasPublisher={!!book.publisher}
      />
      <CarouselMobile images={galleryImages} />
      <div class="flex flex-col gap-2">
        <div class="text-balance text-lg font-semibold text-on-surface-strong">
          {book.title}
        </div>
      </div>
      <div class="flex items-center justify-evenly">
        <LikeButton isCircleButton book={book} user={user} />
        <CollectButton isCircleButton book={book} user={user} />
        <WishlistButton isCircleButton book={book} user={user} />
        <ShareButton isCircleButton />
      </div>
      {book.description && (
        <Card.Description>{book.description}</Card.Description>
      )}
      <AvailabilityBadge availabilityStatus={book.availabilityStatus} />
      <PurchaseLink purchaseLink={book.purchaseLink} />
      <BookCredits releaseDate={book.releaseDate} />
      <TagList tags={book.tags ?? []} />
    </div>
  );
};
