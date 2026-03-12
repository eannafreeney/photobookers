import { AuthUser } from "../../../../../../types";
import BookGalleryForm from "../../../images/forms/BookGalleryForm";
import AppLayout from "../../../../../components/layouts/AppLayout";
import { Flash } from "../../../../../../types";
import Page from "../../../../../components/layouts/Page";
import BookCoverForm from "../../../images/forms/BookCoverForm";
import { BookFormAdmin } from "../components/AddBookForm";
import Breadcrumbs from "../../components/Breadcrumbs";
import { getBookById } from "../../../books/services";
import PreviewButton from "../../../../api/components/PreviewButton";
import PublishToggleForm from "../../../books/components/PublishToggleForm";

type Props = {
  bookId: string;
  user: AuthUser;
  flash: Flash;
  currentPath: string;
};

const EditBookPageAdmin = async ({
  user,
  bookId,
  flash,
  currentPath,
}: Props) => {
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
            { label: "Admin Books Overview", href: "/dashboard/admin/books" },
            {
              label: `Edit "${book.title}"`,
            },
          ]}
        />
        <div class="flex justify-end">
          <div class="flex items-center gap-4">
            <PublishToggleForm book={book} />
            <PreviewButton book={book} user={user} />
          </div>
        </div>
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

export default EditBookPageAdmin;
