import PurchaseLink from "../../../../components/app/PurchaseLink";
import ShareButton from "../../../api/components/ShareButton";
import TagList from "../../../../components/app/TagList";
import FavouriteButton from "../../../api/components/FavouriteButton";
import RelatedBooks from "../RelatedBooks";
import CommentsSection from "../CommentsSection";
import Divider from "../../../../components/Divider";
import BookCredits from "./BookCredits";
import BookPressSection from "./BookPressSection";
import { bookShareText, bookShareTitle } from "../../../../lib/share";
import { bookUrl } from "../../spotlightUrls";
import SpotlightCreator from "../SpotlightCreator";
import Card from "@/components/app/Card";
import AvailabilityBadge from "@/components/app/AvailabilityBadge";
import { BookDetailProps, shouldTrackOutboundPurchase } from "./BookDetail";
import { isFeatureEnabledForUser } from "@/lib/features";

const scrollPanelClass =
  "h-full overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const BookDetailDesktop = ({ galleryImages, book, user }: BookDetailProps) => {
  const hasArtist = !!book.artist;
  const hasPublisher = !!book.publisher;
  const creditCols = hasArtist && hasPublisher ? "grid-cols-2" : "grid-cols-1";
  const showPress =
    isFeatureEnabledForUser("bookPressLinks", user) &&
    (book.pressLinks?.length ?? 0) > 0;

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
              {showPress ? <BookPressSection links={book.pressLinks} /> : null}
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

export default BookDetailDesktop;
