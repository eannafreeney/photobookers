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
import FavoriteButton from "../../api/components/WishlistButton";
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
    <div class="flex flex-col gap-6">
      <FeaturedPageHeader
        title="Book of the Day"
        name={book.title}
        weekStart={date}
      />
      {galleryImages.length > 0 ? (
        isMobile ? (
          <PageBleed>
            <CarouselMobile images={galleryImages} />
          </PageBleed>
        ) : (
          <PageBleed>
            <HorizontalScrollGallery
              images={galleryImages}
              imageAlt={book.title}
            />
          </PageBleed>
        )
      ) : null}

      <div class="mx-auto grid w-full grid-cols-2 gap-4 md:max-w-xl">
        <FavoriteButton book={book} user={user} />
        <ShareButton
          title={bookOfTheDayShareTitle(book)}
          text={bookOfTheDayShareText(book)}
          url={botdUrl(date)}
        />
      </div>
      <div class="flex flex-col gap-8 mx-auto md:max-w-xl">
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
