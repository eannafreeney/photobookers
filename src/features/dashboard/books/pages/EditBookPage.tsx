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
import InfoPage from "../../../../pages/InfoPage";

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
  const [err, book] = await getBookById(bookId);

  if (err || !book) {
    return <InfoPage errorMessage="Book not found" user={user} />;
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

  console.log("book", book);
  console.log("user", user);

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
              <PublishToggleForm book={book} user={user} />
              <PreviewButton book={book} user={user} />
            </div>
          </div>
        )}
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0"
          id="book-images"
        >
          <BookCoverForm
            initialUrl={book.coverUrl ?? null}
            book={book}
            user={user}
          />
          <hr class="my-4 md:hidden" />
          <BookGalleryForm
            initialImages={
              book.images?.map((image: { id: string; imageUrl: string }) => ({
                id: image.id,
                url: image.imageUrl,
              })) ?? []
            }
            book={book}
            user={user}
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
