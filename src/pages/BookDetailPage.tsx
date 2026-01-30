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
      </Page>
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
