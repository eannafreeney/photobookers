import TableSearch from "../../../../components/app/TableSearch";
import SectionTitle from "../../../../components/app/SectionTitle";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import { Book, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import PreviewButton from "../../../api/components/PreviewButton";
import PublishToggleForm from "./PublishToggleForm";
import DeleteBookForm from "./BookDeleteForm";
import { getBookFunnelCounts } from "../../../book-analytics/funnel";
import type { BookFunnelCounts } from "../../../book-analytics/funnel";
import Card from "../../../../components/app/Card";
import Table from "../../../../components/app/Table";
import { canEditBook } from "../../../../lib/permissions";
import { InfiniteScroll } from "../../../../components/app/InfiniteScroll";
import BookApprovalStatusPill from "../../admin/books/components/BookApprovalStatusPill";
import { dragHandleIcon } from "../../../../lib/icons";

type Props = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  user: AuthUser;
  currentPath: string;
  page: number;
  totalPages: number;
  reorderEnabled?: boolean;
};

const reorderHandleAttrs = {
  draggable: true,
  "@dragstart": "onReorderDragStart($event, $el.closest('tr'))",
  "@dragend": "onReorderDragEnd()",
};

const reorderRowAttrs = {
  "@dragenter.prevent": "onReorderDragEnter($el)",
  "@dragover.prevent": true,
  "@drop.prevent": true,
};

const BooksOverviewDesktop = async ({
  books,
  user,
  currentPath,
  page,
  totalPages,
  reorderEnabled = false,
}: Props) => {
  const targetId = "books-table-body";
  const funnelCounts = await getBookFunnelCounts(books.map((book) => book.id));
  const showArtistColumn = user.creator?.type !== "artist";
  const showPublisherColumn = user.creator?.type !== "publisher";

  const tbodyAttrs = reorderEnabled
    ? {
        "@books:updated.window":
          "$ajax('/dashboard', { target: 'books-table-body' })",
      }
    : {
        "x-init": "true",
        "@books:updated.window":
          "$ajax('/dashboard', { target: 'books-table-body' })",
      };

  const tableWrapperAttrs = reorderEnabled
    ? {
        "x-data": `booksTableReorder(${JSON.stringify(books.map((book) => book.id))})`,
      }
    : {};

  const emptyFunnel: BookFunnelCounts = {
    views: 0,
    favorites: 0,
    outboundClicks: 0,
  };

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="books-table"
          action="/dashboard"
          placeholder="Filter books..."
        />
        <div class="flex items-center gap-2">
          <Link href="/dashboard/books/import">
            <Button variant="outline" color="inverse">
              Import CSV
            </Button>
          </Link>
          <Link href="/dashboard/books/new">
            <Button variant="solid" color="primary">
              New Book
            </Button>
          </Link>
        </div>
      </div>
      <div {...tableWrapperAttrs}>
        <Table id="books-table">
          <Table.Head>
            <tr>
              {reorderEnabled ? (
                <Table.HeadRow>
                  <span class="sr-only">Reorder</span>
                </Table.HeadRow>
              ) : null}
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Title</Table.HeadRow>
              {showArtistColumn ? <Table.HeadRow>Artist</Table.HeadRow> : null}
              {showPublisherColumn ? (
                <Table.HeadRow>Publisher</Table.HeadRow>
              ) : null}
              <Table.HeadRow>Views</Table.HeadRow>
              <Table.HeadRow>Favs</Table.HeadRow>
              <Table.HeadRow>Outbound clicks</Table.HeadRow>
              <Table.HeadRow>Approval</Table.HeadRow>
              <Table.HeadRow>Publish</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} {...tbodyAttrs}>
            {books.map((book) => (
              <BookTableRow
                book={book}
                user={user}
                funnel={funnelCounts.get(book.id) ?? emptyFunnel}
                reorderEnabled={reorderEnabled}
                showArtistColumn={showArtistColumn}
                showPublisherColumn={showPublisherColumn}
              />
            ))}
          </Table.Body>
        </Table>
      </div>
      {!reorderEnabled && totalPages > 1 ? (
        <InfiniteScroll
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      ) : null}
    </div>
  );
};

export default BooksOverviewDesktop;

type RowProps = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser;
  funnel: BookFunnelCounts;
  reorderEnabled: boolean;
  showArtistColumn: boolean;
  showPublisherColumn: boolean;
};

const BookTableRow = ({
  book,
  user,
  funnel,
  reorderEnabled,
  showArtistColumn,
  showPublisherColumn,
}: RowProps) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  return (
    <tr
      {...{ "data-book-id": book.id }}
      {...(reorderEnabled ? reorderRowAttrs : {})}
    >
      {reorderEnabled ? (
        <Table.BodyRow>
          <div
            class="flex items-center justify-center text-on-surface/50 cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...reorderHandleAttrs}
          >
            {dragHandleIcon()}
          </div>
        </Table.BodyRow>
      ) : null}
      <Table.BodyRow>
        {book.coverUrl ? (
          <img src={book.coverUrl ?? ""} alt={book.title} class="w-auto h-12" />
        ) : (
          <a href={`/dashboard/books/${book.id}#book-images`}>
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
        >
          {book.title}
        </Link>
      </Table.BodyRow>
      {showArtistColumn ? (
        <Table.BodyRow>
          <Link href={`/creators/${book.artist?.slug}`}>
            {book.artist?.displayName}
          </Link>
        </Table.BodyRow>
      ) : null}
      {showPublisherColumn ? (
        <Table.BodyRow>
          <Link href={`/creators/${book.publisher?.slug}`}>
            {book.publisher?.displayName ?? ""}
          </Link>
        </Table.BodyRow>
      ) : null}
      <Table.BodyRow>
        <Card.Text>{funnel.views}</Card.Text>
      </Table.BodyRow>
      <Table.BodyRow>
        <Card.Text>{funnel.favorites}</Card.Text>
      </Table.BodyRow>
      <Table.BodyRow>
        <Card.Text>{funnel.outboundClicks}</Card.Text>
      </Table.BodyRow>
      <Table.BodyRow>
        <BookApprovalStatusPill
          approvalStatus={book.approvalStatus ?? "pending"}
        />
      </Table.BodyRow>
      <Table.BodyRow>
        <PublishToggleForm book={book} user={user} />
      </Table.BodyRow>
      <Table.BodyRow>
        <PreviewButton book={book} user={user} />
      </Table.BodyRow>
      <Table.BodyRow>
        <a href={`/dashboard/books/${book.id}`}>
          <Button
            variant="outline"
            color="inverse"
            disabled={!canEditBook(user, book)}
          >
            <span>Edit</span>
          </Button>
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        <DeleteBookForm book={book} user={user} />
      </Table.BodyRow>
    </tr>
  );
};
