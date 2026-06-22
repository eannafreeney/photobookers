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
import { Creator } from "../../../db/schema";
import RelatedBooks from "../components/RelatedBooks";
import CommentsSection from "../components/CommentsSection";
import Divider from "../../../components/Divider";
import BookCredits from "./BookCredits";
import PageBleed from "../../../components/layouts/PageBleed";
import Tabs from "../../../components/app/Tabs";
import Show from "../../../components/app/Show";
import BookGridWrapper from "./BookGridWrapper";
import { bookShareText, bookShareTitle } from "../../../lib/share";
import { bookUrl } from "../spotlightUrls";
import MobileHeader from "./MobileHeader";

const shouldTrackOutboundPurchase = (book: BookWithGalleryImages) =>
  book.publicationStatus === "published" && book.approvalStatus === "approved";

type BookDetailProps = {
  isMobile: boolean;
  galleryImages: string[];
  book: BookWithGalleryImages;
  currentPath: string;
  user: AuthUser | null;
  currentPage: number;
};

type BookMobileProps = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  currentPath: string;
  user: AuthUser | null;
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
}: BookDetailProps) => {
  return isMobile ? (
    <DetailMobile
      galleryImages={galleryImages}
      book={book}
      currentPath={currentPath}
      user={user}
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
            <div class="flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4">
              <span class="kicker text-accent">Photobook</span>
              <h1 class="text-balance font-display text-3xl xl:text-5xl font-medium leading-tight text-on-surface-strong">
                {book.title}
              </h1>
              <p class="text-balance text-base text-on-surface">
                {book.artist?.displayName}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <WishlistButton book={book} user={user} />
              <ShareButton
                title={bookShareTitle(book)}
                text={bookShareText(book)}
                url={bookUrl(book.slug)}
              />
            </div>
            <div class="flex flex-col gap-4">
              {book.description && (
                <Card.Description>{book.description}</Card.Description>
              )}
              <AvailabilityBadge availabilityStatus={book.availabilityStatus} />
              <TagList tags={book.tags ?? []} />
              <PurchaseLink
                bookSlug={book.slug}
                purchaseLink={book.purchaseLink}
                trackOutbound={shouldTrackOutboundPurchase(book)}
              />
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
            showHeader={false}
          />
          <CreatorCard
            creator={book.publisher}
            currentPath={currentPath}
            title="Publisher"
            user={user}
            showHeader={false}
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
  currentPage,
}: BookMobileProps) => {
  return (
    <div class="flex flex-col gap-4">
      <MobileHeader kicker={book.artist?.displayName ?? ""} title={book.title}>
        <WishlistButton book={book} user={user} />
      </MobileHeader>
      <Tabs defaultTab="books">
        <Tabs.LinkContainer>
          <Tabs.Link tabId="books">Book</Tabs.Link>
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
          {book.description && (
            <Card.Description>{book.description}</Card.Description>
          )}
          <AvailabilityBadge availabilityStatus={book.availabilityStatus} />
          <ShareButton
            title={bookShareTitle(book)}
            text={bookShareText(book)}
            url={bookUrl(book.slug)}
          />
          <PurchaseLink
            bookSlug={book.slug}
            purchaseLink={book.purchaseLink}
            trackOutbound={shouldTrackOutboundPurchase(book)}
          />
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
            showHeader={false}
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
            isMobile
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
