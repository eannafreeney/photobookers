import { AuthUser } from "../../../types";
import { getBookById } from "../../services/books";
import BookGalleryForm from "../../components/cms/forms/BookGalleryForm";
import AppLayout from "../../components/layouts/AppLayout";
import { Flash } from "../../../types";
import Page from "../../components/layouts/Page";
import BookCoverForm from "../../components/cms/forms/BookCoverForm";
import { BookFormAdmin } from "./BookFormAdmin";
import Breadcrumbs from "../app/Breadcrumbs";

type Props = {
  bookId: string;
  user: AuthUser;
  flash: Flash;
};

const EditBookFormAdmin = async ({ user, bookId, flash }: Props) => {
  const book = await getBookById(bookId);

  if (!book) {
    return <div>Book not found</div>;
  }

  const formValues = {
    title: book.title,
    artist_id: book.artistId,
    publisher_id: book.publisherId,
    description: book.description,
    purchase_link: book.purchaseLink,
    tags: book.tags?.join(", "),
    availability_status: book.availabilityStatus,
    release_date: book?.releaseDate
      ? new Date(book.releaseDate).toISOString().split("T")[0]
      : "",
  };

  console.log("book", book);
  console.log("formValues", formValues);

  return (
    <AppLayout title="Edit Book" user={user} flash={flash}>
      <Page>
        <Breadcrumbs
          items={[
            { label: "Admin Books Overview", href: "/dashboard/admin/books" },
            {
              label: `Edit "${book.title}"`,
            },
          ]}
        />
        <BookFormAdmin bookId={book.id} formValues={formValues} />
        <hr class="my-4" />
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0"
          id="book-images"
        >
          <BookCoverForm initialUrl={book.coverUrl ?? null} bookId={book.id} />
          <hr class="my-4 md:hidden" />
          <BookGalleryForm
            initialImages={
              book.images?.map((image: { id: string; imageUrl: string }) => ({
                id: image.id,
                url: image.imageUrl,
              })) ?? []
            }
            bookId={book.id}
          />
        </div>
      </Page>
    </AppLayout>
  );
};

export default EditBookFormAdmin;
