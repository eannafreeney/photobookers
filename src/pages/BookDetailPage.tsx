import AppLayout from "../components/layouts/AppLayout";
import { getBookBySlug } from "../services/books";
import { AuthUser } from "../../types";
import { Book, Creator } from "../db/schema";
import Page from "../components/layouts/Page";
import DetailMobile from "../components/app/DetailMobile";
import DetailDesktop from "../components/app/DetailDesktop";
import ErrorPage from "./error/errorPage";

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
