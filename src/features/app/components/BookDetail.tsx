import { AuthUser } from "../../../../types";
import AvailabilityBadge from "../../../components/app/AvailabilityBadge";
import Card from "../../../components/app/Card";
import CarouselMobile from "../../../components/app/CarouselMobile";
import CreatorCard from "../../../components/app/CreatorCard";
import PurchaseLink from "../../../components/app/PurchaseLink";
import ShareButton from "../../api/components/ShareButton";
import TagList from "../../../components/app/TagList";
import WishlistButton from "../../api/components/WishlistButton";
import { BookWithGalleryImages } from "../types";
import CollectButton from "../../api/components/CollectButton";
import { Creator } from "../../../db/schema";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import RelatedBooks from "../components/RelatedBooks";
import CommentsSection from "../components/CommentsSection";
import LikeButton from "../../api/components/LikeButton";
import Divider from "../../../components/Divider";
import BookCredits from "./BookCredits";
import PageBleed from "../../../components/layouts/PageContent";
import Tabs from "../../../components/app/Tabs";
import Show from "../../../components/app/Show";
import BookGridWrapper from "./BookGridWrapper";

type BookMobileProps = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  currentPath: string;
  user: AuthUser | null;
  isMobile?: boolean;
  creator?: Creator | null;
  currentPage: number;
};

type BookDesktopProps = {
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
  currentPage,
}: BookMobileProps) => {
  return isMobile ? (
    <DetailMobile
      galleryImages={galleryImages}
      book={book}
      currentPath={currentPath}
      user={user}
      isMobile={isMobile}
      creator={book.artist}
      currentPage={currentPage}
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
}: BookDesktopProps) => {
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
            <div class="flex flex-col gap-0">
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
  currentPage,
}: BookMobileProps) => {
  return (
    <div class="flex flex-col gap-4">
      {creator && <MobileCreatorCard creator={creator} user={user} />}
      <Tabs defaultTab="books">
        <Tabs.LinkContainer>
          <Tabs.Link tabId="books">Books</Tabs.Link>
          <Tabs.Link tabId="comments">Comments</Tabs.Link>
          <Tabs.Link tabId="artist">Artist</Tabs.Link>
          <Show when={!!book.publisher}>
            <Tabs.Link tabId="publisher">Publisher</Tabs.Link>
          </Show>
        </Tabs.LinkContainer>
        <Tabs.Panel tabId="books">
          <PageBleed>
            <CarouselMobile images={galleryImages} />
          </PageBleed>
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
        </Tabs.Panel>
        <Tabs.Panel tabId="comments">
          <CommentsSection
            bookId={book.id}
            user={user}
            bookSlug={book.slug}
            isMobile
          />
        </Tabs.Panel>
        <Tabs.Panel tabId="artist">
          <CreatorCard
            creator={book.artist}
            currentPath={currentPath}
            user={user}
          />
          <Divider />
          <BookGridWrapper
            bookSlug={book.slug}
            currentPage={currentPage}
            creator={book?.artist ?? null}
            currentPath={currentPath}
            user={user}
          />
        </Tabs.Panel>
        <Tabs.Panel tabId="publisher">
          <CreatorCard
            creator={book.publisher}
            currentPath={currentPath}
            user={user}
          />
          <Divider />
          <BookGridWrapper
            bookSlug={book.slug}
            currentPage={currentPage}
            creator={book?.publisher ?? null}
            currentPath={currentPath}
            user={user}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};
