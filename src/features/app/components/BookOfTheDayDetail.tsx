import CarouselMobile from "../../../components/app/CarouselMobile";
import HorizontalScrollGallery from "../../../components/app/HorizontalScrollGallery";
import SpotlightCreatorLink from "./SpotlightCreatorLink";
import PageBleed from "../../../components/layouts/PageBleed";
import { AuthUser } from "../../../../types";
import { BookWithGalleryImages } from "../types";
import CommentsSection from "./CommentsSection";
import ExpandableDescription from "./ExpandableDescription";
import NewsletterCard from "./NewsletterCard";
import ShareButton from "../../api/components/ShareButton";
import { botdUrl } from "../spotlightUrls";
import FeaturedPageHeader from "./FeaturedPageHeader";
import FavoriteButton from "../../api/components/FavouriteButton";
import {
  bookOfTheDayShareText,
  bookOfTheDayShareTitle,
} from "../../../lib/share";

type Props = {
  book: BookWithGalleryImages;
  galleryImages: string[];
  isMobile: boolean;
  currentPath: string;
  user: AuthUser | null;
  date: Date;
  editorial?: string | null;
};

const BookOfTheDayDetail = async ({
  book,
  galleryImages,
  isMobile,
  currentPath,
  user,
  date,
}: Props) => {
  return (
    <div class="flex w-full min-w-0 flex-col gap-6">
      <FeaturedPageHeader
        title="Book of the Day"
        name={book.title}
        weekStart={date}
      />
      {galleryImages.length > 0 ? (
        isMobile ? (
          <div class="min-w-0">
            <PageBleed>
              <CarouselMobile images={galleryImages} />
            </PageBleed>
          </div>
        ) : (
          <div class="min-w-0">
            <PageBleed>
              <HorizontalScrollGallery
                images={galleryImages}
                imageAlt={book.title}
              />
            </PageBleed>
          </div>
        )
      ) : null}

      <div class="mx-auto flex w-full flex-col gap-8 md:max-w-xl">
        <div class="grid grid-cols-2 gap-4">
          <FavoriteButton book={book} user={user} />
          <ShareButton
            title={bookOfTheDayShareTitle(book)}
            text={bookOfTheDayShareText(book)}
            url={botdUrl(date)}
          />
        </div>
        {book.description?.trim() ? (
          <ExpandableDescription text={book.description.trim()} />
        ) : null}
        <NewsletterCard />
        <SpotlightCreatorLink creator={book.artist} role="Artist" />
        {book.publisher && (
          <SpotlightCreatorLink creator={book.publisher} role="Publisher" />
        )}
        <CommentsSection
          bookId={book.id}
          user={user}
          bookSlug={book.slug}
          commentsRefreshPath={currentPath}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default BookOfTheDayDetail;
