import { AuthUser } from "../../../../../../types";
import Button from "../../../../../components/app/Button";
import Card from "../../../../../components/app/Card";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";
import Link from "../../../../../components/app/Link";
import Table from "../../../../../components/app/Table";
import { editIcon } from "../../../../../lib/icons";
import { formatDate } from "../../../../../utils";
import PreviewButton from "../../../../api/components/PreviewButton";
import {
  findCollectionCount,
  findWishlistCount,
} from "../../../../api/services";
import PublishToggleForm from "../../../books/components/PublishToggleForm";
import DeleteFormButton from "../../components/DeleteFormButton";
import BookStatusForm from "../forms/BookStatusForm";
import { getAllBooksAdmin } from "../services";
import { BookWithAdminRelations } from "../types";

type Props = {
  status?: "approved" | "pending" | "rejected" | undefined;
  currentPage: number;
  searchQuery?: string;
  currentPath: string;
  user: AuthUser | null;
};

const AdminBooksTableAndFilter = async ({
  status = undefined,
  currentPage,
  searchQuery,
  currentPath,
  user,
}: Props) => {
  const result = await getAllBooksAdmin(currentPage, searchQuery, status);

  if (!result?.books) {
    return <div>No featured books found</div>;
  }

  const { books, totalPages, page } = result;

  const targetId = "books-table-body";

  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@books:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/books', { target: 'books-table-container' })`,
  };

  return (
    <div x-data>
      <div
        id="books-table-container"
        class="flex flex-col gap-4"
        x-ref="paginationContent"
      >
        <BookStatusForm status={status} />
        <Table id="books-table">
          <Table.Head>
            <tr>
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Title</Table.HeadRow>
              <Table.HeadRow>Artist</Table.HeadRow>
              <Table.HeadRow>Publisher</Table.HeadRow>
              <Table.HeadRow>Release Date</Table.HeadRow>
              <Table.HeadRow>Wishlists</Table.HeadRow>
              <Table.HeadRow>Collections</Table.HeadRow>
              <Table.HeadRow>Publish</Table.HeadRow>
              <Table.HeadRow>Actions</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} {...tableBodyAttrs} xMerge="append">
            {books.map((book) => (
              <BooksTableRow key={book.id} book={book} user={user} />
            ))}
          </Table.Body>
        </Table>
        <InfiniteScroll
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </div>
    </div>
  );
};

export default AdminBooksTableAndFilter;

type BooksTableRowProps = {
  book: BookWithAdminRelations;
  user: AuthUser | null;
};

const BooksTableRow = ({ book, user }: BooksTableRowProps) => {
  if (!user) return <></>;

  return (
    <tr>
      <Table.BodyRow>
        {book.coverUrl ? (
          <img src={book.coverUrl ?? ""} alt={book.title} class="w-auto h-12" />
        ) : (
          <a href={`/dashboard/admin/books/${book.id}/update#book-images`}>
            <Button variant="outline" color="warning">
              <span>Upload Cover</span>
            </Button>
          </a>
        )}
      </Table.BodyRow>
      <Table.BodyRow>
        <Link
          href={
            book.publicationStatus === "published"
              ? `/books/${book.slug}`
              : `/books/preview/${book.slug}`
          }
          target="_blank"
        >
          {book.title}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${book.publisher?.slug}`}>
          {book.publisher?.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        {book.releaseDate ? formatDate(book.releaseDate) : ""}
      </Table.BodyRow>
      <Table.BodyRow>
        <WishlistCount bookId={book.id} />
      </Table.BodyRow>
      <Table.BodyRow>
        <CollectionCount bookId={book.id} />
      </Table.BodyRow>
      <Table.BodyRow>
        <PublishToggleForm book={book} user={user} />
      </Table.BodyRow>
      <Table.BodyRow>
        <PreviewButton book={book} user={user} />
      </Table.BodyRow>
      <Table.BodyRow>
        <a href={`/dashboard/admin/books/${book.id}/update`}>
          <button class="cursor-pointer">{editIcon()}</button>
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        <DeleteFormButton action={`/dashboard/admin/books/${book.id}/delete`} />
      </Table.BodyRow>
    </tr>
  );
};

const WishlistCount = async ({ bookId }: { bookId: string }) => {
  const wishlistCount = await findWishlistCount(bookId);
  return <Card.Text>{wishlistCount.toString() ?? "0"}</Card.Text>;
};

const CollectionCount = async ({ bookId }: { bookId: string }) => {
  const collectionCount = await findCollectionCount(bookId);
  return <Card.Text>{collectionCount.toString() ?? "0"}</Card.Text>;
};
