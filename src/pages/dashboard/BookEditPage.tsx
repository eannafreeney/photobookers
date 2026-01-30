import { BookForm } from "../../components/cms/forms/BookForm";
import { AuthUser } from "../../../types";
import { getBookById } from "../../services/books";
import BookImageForm from "../../components/cms/forms/BookImageForm";
import Breadcrumbs from "../../components/app/Breadcrumbs";
import BookGalleryForm from "../../components/cms/forms/BookGalleryForm";
import AppLayout from "../../components/layouts/AppLayout";
import { Flash } from "../../../types";
import Page from "../../components/layouts/Page";

type EditBookPageProps = {
  bookId: string;
  user: AuthUser;
  flash: Flash;
};

const BookEditPage = async ({ user, bookId, flash }: EditBookPageProps) => {
  const book = await getBookById(bookId);

  if (!book) {
    return <div>Book not found</div>;
  }

  const formValues = {
    title: book.title,
    artist_id: book.artistId,
    publisher_id: book.publisherId,
    description: book.description,
    specs: book.specs,
    tags: book.tags?.join(", "),
    availability_status: book.availabilityStatus,
    release_date: book?.releaseDate
      ? new Date(book.releaseDate).toISOString().split("T")[0]
      : "",
  };

  const dateIsInPast = book?.releaseDate
    ? new Date(book.releaseDate) < new Date()
    : false;

  console.log("dateIsInPast", dateIsInPast);

  const isPublisher = user.creator?.type === "publisher";

  const action = `/dashboard/books/edit/${bookId}/${
    isPublisher ? "publisher" : "artist"
  }`;

  return (
    <AppLayout title="Edit Book" user={user} flash={flash}>
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard/books" },
            {
              label: `Edit "${book.title}"`,
            },
          ]}
        />
        <BookForm
          action={action}
          bookId={book.id}
          dateIsInPast={dateIsInPast}
          formValues={formValues}
          isPublisher={isPublisher}
        />
        <hr class="my-4" />
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0"
          id="book-images"
        >
          <BookImageForm initialUrl={book.coverUrl ?? null} bookId={book.id} />
          <hr class="my-4 md:hidden" />
          <BookGalleryForm
            initialImages={
              book.images?.map((image) => ({
                id: image.id,
                url: image.imageUrl ?? "",
              })) ?? []
            }
            bookId={book.id}
          />
        </div>
      </Page>
    </AppLayout>
  );
};
export default BookEditPage;
