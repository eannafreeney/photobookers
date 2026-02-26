import { AuthUser } from "../../../../types";
import AvailabilityBadge from "../../../components/app/AvailabilityBadge";
import Button from "../../../components/app/Button";
import Card from "../../../components/app/Card";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import Carousel from "../../../components/app/Carousel";
import CarouselMobile from "../../../components/app/CarouselMobile";
import CreatorCard from "../../../components/app/CreatorCard";
import PurchaseLink from "../../../components/app/PurchaseLink";
import ShareButton from "../../../components/app/ShareButton";
import TagList from "../../../components/app/TagList";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { Book, Creator } from "../../../db/schema";
import { canEditBook } from "../../../lib/permissions";
import ErrorPage from "../../../pages/error/errorPage";
import { formatDate } from "../../../utils";
import WishlistButton from "../../api/components/WishlistButton";
import { getBookBySlug } from "../services";

export type BookWithGalleryImages = Omit<
  Book & { artist: Creator; publisher: Creator },
  "images"
> & {
  images: { imageUrl: string }[];
};

type BookDetailPageProps = {
  user: AuthUser | null;
  bookSlug: string;
  currentPath: string;
  status?: "published" | "draft";
  isPreview?: boolean;
  isMobile: boolean;
};

const BookDetailPage = async ({
  user,
  bookSlug,
  currentPath,
  status = "published",
  isPreview = false,
  isMobile,
}: BookDetailPageProps) => {
  const result = await getBookBySlug(bookSlug, status);
  if (!result?.book || !result.book.artist) {
    return <ErrorPage errorMessage="Book not found" user={user} />;
  }

  const { book } = result;

  const galleryImages = [
    book.coverUrl,
    ...(book?.images?.map((image) => image.imageUrl) ?? []),
  ];

  return (
    <AppLayout title={book.title} user={user} isPreview={isPreview}>
      <Page>
        {isMobile ? (
          <DetailMobile
            galleryImages={galleryImages}
            book={book}
            currentPath={currentPath}
            user={user}
          />
        ) : (
          <DetailDesktop
            galleryImages={galleryImages}
            book={book}
            currentPath={currentPath}
            user={user}
          />
        )}
      </Page>
    </AppLayout>
  );
};

export default BookDetailPage;

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
              {user?.isAdmin && (
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

const DetailMobile = ({
  galleryImages,
  book,
  currentPath,
  user,
}: DetailProps) => {
  return (
    <div class="flex flex-col gap-4 ">
      <CarouselMobile images={galleryImages} />
      <div class="flex flex-col gap-2">
        <h3 class="text-balance text-xl font-semibold text-on-surface-strong">
          {book.title}
        </h3>
        {book.artist && <CardCreatorCard creatorType="artist" book={book} />}
        {book.publisher && (
          <CardCreatorCard creatorType="publisher" book={book} />
        )}
      </div>
      <div class="flex items-center gap-2">
        <WishlistButton book={book} user={user} />
        <ShareButton />
      </div>
      {book.releaseDate && (
        <Card.Description>{formatDate(book.releaseDate)}</Card.Description>
      )}
      {book.description && (
        <Card.Description>{book.description}</Card.Description>
      )}
      <AvailabilityBadge availabilityStatus={book.availabilityStatus} />
      <PurchaseLink purchaseLink={book.purchaseLink} />
      <TagList tags={book.tags ?? []} />
      {canEditBook(user, book) && (
        <a href={`/dashboard/admin/books/edit/${book.id}`}>
          <Button variant="outline" color="secondary" width="sm">
            Edit
          </Button>
        </a>
      )}
      <div class="flex flex-col sm:items-center gap-2">
        <CreatorCard
          creator={book.artist}
          currentPath={currentPath}
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
  );
};
