import { AuthUser } from "../../../../types";
import AvailabilityBadge from "../../../components/app/AvailabilityBadge";
import Card from "../../../components/app/Card";
import CarouselMobile from "../../../components/app/CarouselMobile";
import CreatorCard from "../../../components/app/CreatorCard";
import PurchaseLink from "../../../components/app/PurchaseLink";
import ShareButton from "../../api/components/ShareButton";
import TagList from "../../../components/app/TagList";
import FavouriteButton from "../../api/components/FavouriteButton";
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
import SpotlightCreator from "./SpotlightCreator";

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
  currentPath?: string;
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
    <DetailDesktop galleryImages={galleryImages} book={book} user={user} />
  );
};

export default BookDetail;

const scrollPanelClass =
  "h-full overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const DetailDesktop = ({ galleryImages, book, user }: BookDesktopProps) => {
  const hasArtist = !!book.artist;
  const hasPublisher = !!book.publisher;
  const creditCols = hasArtist && hasPublisher ? "grid-cols-2" : "grid-cols-1";

  return (
    <div class="flex flex-col gap-8">
      <div class="flex gap-8 h-[calc(100vh-8rem)]">
        <div class={`w-1/2 ${scrollPanelClass}`}>
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

        <div class={`w-1/2 ${scrollPanelClass}`}>
          <div class="mb-4 flex flex-col">
            <div class="flex flex-col gap-2 border-b-2 border-on-surface-strong pb-4">
              <span class="kicker text-accent">Photobook</span>
              <h1 class="text-balance font-display text-3xl xl:text-5xl font-medium leading-tight text-on-surface-strong">
                {book.title}
              </h1>
              {(hasArtist || hasPublisher) && (
                <div class={`grid ${creditCols} items-center gap-4`}>
                  {hasArtist && (
                    <a href={`/creators/${book.artist!.slug}`}>
                      <SpotlightCreator
                        creator={book.artist}
                        role="Artist"
                        truncateName={false}
                      />
                    </a>
                  )}
                  {hasPublisher && (
                    <a href={`/creators/${book.publisher!.slug}`}>
                      <SpotlightCreator
                        creator={book.publisher}
                        role="Publisher"
                        truncateName={false}
                      />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div class="grid grid-cols-2 gap-4 py-4">
              <FavouriteButton book={book} user={user} />
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
        <div class="flex justify-between items-center gap-2">
          <FavouriteButton book={book} user={user} />
          <ShareButton
            title={bookShareTitle(book)}
            text={bookShareText(book)}
            url={bookUrl(book.slug)}
          />
        </div>
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
            showHeader={false}
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
