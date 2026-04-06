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
              <Credits
                releaseDate={book.releaseDate}
                publisher={book.publisher}
              />
            </div>
          </div>
        </div>
        <div class="w-1/5">
          <CreatorCard
            creator={book.artist}
            currentPath={currentPath}
            title="Artist"
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
  isMobile,
  creator,
}: BookDetailProps) => {
  return (
    <div class="flex flex-col gap-4">
      {isMobile && creator && (
        <MobileCreatorCard creator={creator} user={user} />
      )}
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
      <TagList tags={book.tags ?? []} />
      <CommentsSection bookId={book.id} user={user} bookSlug={book.slug} />
      <Credits releaseDate={book.releaseDate} publisher={book.publisher} />
      <div class="flex flex-col sm:items-center gap-2">
        <CreatorCard
          creator={book.artist}
          currentPath={currentPath}
          user={user}
        />
      </div>
      <RelatedBooks book={book} user={user} />
    </div>
  );
};

type CreditsProps = {
  releaseDate: Date | null;
  publisher: Creator | null;
};

const Credits = ({ releaseDate, publisher }: CreditsProps) => (
  <div class="flex flex-col gap-2">
    {releaseDate && (
      <>
        <p class="text-sm font-medium text-on-surface-strong">Release Date:</p>
        <Card.Text>{formatDate(releaseDate)}</Card.Text>
      </>
    )}
    {publisher && (
      <>
        <p class="text-sm font-medium text-on-surface-strong">Publisher:</p>
        <CardCreatorCard creator={publisher} />
      </>
    )}
    <p class="text-sm font-medium text-on-surface-strong">Credits</p>
    <p class="text-sm text-on-surface">
      All images on this page are owned by the respective creator.
    </p>
  </div>
);
