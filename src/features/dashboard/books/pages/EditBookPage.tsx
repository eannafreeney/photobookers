import { BookForm } from "../forms/BookForm";
import { AuthUser } from "../../../../../types";
import Breadcrumbs from "../../admin/components/Breadcrumbs";
import BookGalleryForm from "../../images/forms/BookGalleryForm";
import AppLayout from "../../../../components/layouts/AppLayout";
import { Flash } from "../../../../../types";
import Page from "../../../../components/layouts/Page";
import BookCoverForm from "../../images/forms/BookCoverForm";
import { getBookById } from "../services";
import PublishToggleForm from "../components/PublishToggleForm";
import PreviewButton from "../../../api/components/PreviewButton";

type EditBookPageProps = {
  bookId: string;
  user: AuthUser;
  flash: Flash;
  currentPath: string;
};

const BookEditPage = async ({
  user,
  bookId,
  flash,
  currentPath,
}: EditBookPageProps) => {
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

  const publisherIsVerified = book?.publisher?.status === "verified";

  const isPublisher = user.creator?.type === "publisher";

  const action = `/dashboard/books/${bookId}/update/${
    isPublisher ? "publisher" : "artist"
  }`;

  return (
    <AppLayout
      title="Edit Book"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard/books" },
            {
              label: `Edit "${book.title}"`,
            },
          ]}
        />
        {!publisherIsVerified && (
          <div class="flex justify-end">
            <div class="flex items-center gap-4">
              <PublishToggleForm book={book} />
              <PreviewButton book={book} user={user} />
            </div>
          </div>
        )}
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
        <hr class="my-4" />
        <BookForm
          action={action}
          bookId={book.id}
          formValues={formValues}
          isPublisher={isPublisher}
        />
      </Page>
    </AppLayout>
  );
};

export default BookEditPage;
