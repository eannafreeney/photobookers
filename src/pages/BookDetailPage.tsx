import AppLayout from "../components/layouts/AppLayout";
import Carousel from "../components/app/Carousel";
import Card from "../components/app/Card";
import { getBookBySlug } from "../services/books";
import { AuthUser } from "../../types";
import { Book, Creator } from "../db/schema";
import CardButtons from "../components/app/CardButtons";
import TagList from "../components/app/TagList";
import { formatDate } from "../utils";
import Page from "../components/layouts/Page";
import CreatorCard from "../components/app/CreatorCard";
import CreatorCardMobile from "../components/app/CreatorCardMobile";

type BookDetailPageProps = {
  user: AuthUser | null;
  bookSlug: string;
};

const BookDetailPage = async ({ user, bookSlug }: BookDetailPageProps) => {
  const result = await getBookBySlug(bookSlug);
  if (!result?.book || !result.book.artist) {
    return (
      <AppLayout title="Book not found" user={user}>
        <p>Book not found</p>
      </AppLayout>
    );
  }

  const { book } = result;
  const artist = result.book.artist;

  return (
    <AppLayout title={book.title} user={user}>
      <Page>
        {/* Mobile: Artist header */}
        <CreatorCardMobile creator={artist} />

        {/* Main content area */}
        <div class="flex flex-col lg:flex-row gap-8">
          {/* Left column: Book visuals + actions */}
          <div class="lg:w-2/3 space-y-6">
            {/* Book cover/carousel */}
            <BookCard book={book} />

            {/* Mobile: Publisher card (if exists) */}
            {book.publisher && (
              <div class="lg:hidden">
                <CreatorCardMobile creator={book.publisher} />
              </div>
            )}

            {/* Book details */}
            <div class="space-y-6">
              <div>
                <h2 class="text-lg font-semibold mb-2">About this book</h2>
                <Card.Description>{book.description ?? ""}</Card.Description>
              </div>

              <div>
                <h2 class="text-lg font-semibold mb-2">Specifications</h2>
                <Card.Description class="whitespace-pre-line">
                  {book.specs ?? ""}
                </Card.Description>
              </div>

              {book.tags && book.tags.length > 0 && (
                <TagList tags={book.tags} />
              )}
            </div>
          </div>

          {/* Right column: Sidebar with creator cards (desktop only) */}
          <aside class="hidden lg:block lg:w-1/3 space-y-6">
            <CreatorCard creator={artist} />
            {book.publisher && <CreatorCard creator={book.publisher} />}
          </aside>
        </div>
      </Page>
      {/* <Page>
        <CreatorCardMobile creator={artist} />
        <BookCard book={book} />
        <div class="flex flex-col md:flex-row gap-4">
          {book.publisher ? (
            <CreatorCardMobile creator={book.publisher} />
          ) : (
            <></>
          )}
          <Card.Description>{book.description ?? ""}</Card.Description>
          <Card.Description>{book.specs ?? ""}</Card.Description>
          {book.tags && book.tags.length > 0 && (
            <TagList tags={book.tags ?? []} />
          )}
        </div>
        <CreatorCard creator={book.artist} />
      </Page> */}
    </AppLayout>
  );
};

export default BookDetailPage;

type BookCardProps = {
  book: Book & { publisher: Creator };
};

const BookCard = ({ book }: BookCardProps) => {
  return (
    <Card>
      <Carousel
        images={[
          book.coverUrl,
          ...(book?.images?.map((image) => image.imageUrl) ?? []),
        ]}
      />
      <Card.Body>
        <div>
          <Card.Title>{book.title}</Card.Title>
          <Card.SubTitle>
            {book.releaseDate
              ? formatDate(new Date(book.releaseDate ?? "").toISOString())
              : ""}
          </Card.SubTitle>
        </div>
        <CardButtons bookId={book.id} />
      </Card.Body>
    </Card>
  );
};
