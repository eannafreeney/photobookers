import { AuthUser } from "../../../../../types";
import AvailabilityBadge from "../../../../components/app/AvailabilityBadge";
import Card from "../../../../components/app/Card";
import CarouselMobile from "../../../../components/app/CarouselMobile";
import CreatorCard from "../../../../components/app/CreatorCard";
import PurchaseLink from "../../../../components/app/PurchaseLink";
import ShareButton from "../../../api/components/ShareButton";
import TagList from "../../../../components/app/TagList";
import FavouriteButton from "../../../api/components/FavouriteButton";
import CommentsSection from "../CommentsSection";
import Divider from "../../../../components/Divider";
import BookCredits from "./BookCredits";
import BookPressSection from "./BookPressSection";
import PageBleed from "../../../../components/layouts/PageBleed";
import Tabs from "../../../../components/app/Tabs";
import Show from "../../../../components/app/Show";
import BookGridWrapper from "../BookGridWrapper";
import { bookShareText, bookShareTitle } from "../../../../lib/share";
import { bookUrl } from "../../spotlightUrls";
import MobileHeader from "../MobileHeader";
import { BookDetailProps, shouldTrackOutboundPurchase } from "./BookDetail";
import { isFeatureEnabledForUser } from "@/lib/features";

const BookDetailMobile = ({
  galleryImages,
  book,
  currentPath,
  user,
  currentPage,
}: BookDetailProps) => {
  const showPress =
    isFeatureEnabledForUser("bookPressLinks", user) &&
    (book.pressLinks?.length ?? 0) > 0;

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
          {showPress ? <BookPressSection links={book.pressLinks} /> : null}
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

export default BookDetailMobile;
