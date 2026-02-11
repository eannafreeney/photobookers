import AppLayout from "../components/layouts/AppLayout";
import { getBookBySlug } from "../services/books";
import { AuthUser } from "../../types";
import { Book, Creator } from "../db/schema";
import Page from "../components/layouts/Page";
import DetailMobile from "../components/app/DetailMobile";
import DetailDesktop from "../components/app/DetailDesktop";

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
  device: "mobile" | "desktop";
};

const BookDetailPage = async ({
  user,
  bookSlug,
  currentPath,
  status = "published",
  isPreview = false,
  device,
}: BookDetailPageProps) => {
  const result = await getBookBySlug(bookSlug, status);
  if (!result?.book || !result.book.artist) {
    return (
      <AppLayout title="Book not found" user={user}>
        <p>Book not found</p>
      </AppLayout>
    );
  }

  const { book } = result;

  const galleryImages = [
    book.coverUrl,
    ...(book?.images?.map((image) => image.imageUrl) ?? []),
  ];

  const orientation = device === "mobile" ? "portrait" : "landscape";

  return (
    <AppLayout title={book.title} user={user} isPreview={isPreview}>
      <Page>
        {device === "mobile" ? (
          <DetailMobile
            galleryImages={galleryImages}
            book={book}
            currentPath={currentPath}
            user={user}
            orientation={orientation}
          />
        ) : (
          <DetailDesktop
            galleryImages={galleryImages}
            book={book}
            currentPath={currentPath}
            orientation={orientation}
            user={user}
          />
        )}
      </Page>
    </AppLayout>
  );
};

export default BookDetailPage;
