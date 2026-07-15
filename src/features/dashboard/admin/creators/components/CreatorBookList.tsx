import { AuthUser } from "../../../../../../types";
import Button from "../../../../../components/app/Button";
import Card from "../../../../../components/app/Card";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import TableSearch from "../../../../../components/app/TableSearch";
import FormDelete from "../../../../../components/forms/FormDelete";
import { useUser } from "../../../../../contexts/UserContext";
import { Book, Creator } from "../../../../../db/schema";
import { deleteIcon, dragHandleIcon } from "../../../../../lib/icons";
import { canEditBook } from "../../../../../lib/permissions";
import PreviewButton from "../../../../api/components/PreviewButton";
import {
  formatClickRate,
  getBookFunnelCounts,
  getCreatorCatalogueFunnelTotalsAdmin,
  type BookFunnelCounts,
} from "../../../../book-analytics/funnel";
import ListNavigation from "../../../../app/components/ListNavigation";
import PublishToggleForm from "../../../books/components/PublishToggleForm";
import { getBooksByCreatorId } from "../services";
import { deleteRowAttrs } from "@/lib/utils";

type CreatorBookListProps = {
  creatorId: string;
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
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

const CreatorBookList = async ({
  creatorId,
  currentPath,
  currentPage,
  searchQuery,
}: CreatorBookListProps) => {
  const user = useUser();
  if (!user) return <div>Error: User not found</div>;

  const isSearching = Boolean(searchQuery?.trim());
  const pageLimit = isSearching ? 30 : 10_000;
  const reorderEnabled = !isSearching;

  const [error, result] = await getBooksByCreatorId(
    creatorId,
    currentPage,
    searchQuery,
    pageLimit,
  );
  if (error) return <div>Error: {error.reason}</div>;

  const targetId = "creator-books-table-body";

  const { books, totalPages, page, creator } = result;
  const [funnelCounts, catalogueTotals] = await Promise.all([
    getBookFunnelCounts(books.map((book) => book.id)),
    getCreatorCatalogueFunnelTotalsAdmin(creatorId),
  ]);
  const emptyFunnel: BookFunnelCounts = {
    views: 0,
    favorites: 0,
    outboundClicks: 0,
  };
  const clickRateLabel = formatClickRate(
    catalogueTotals.views,
    catalogueTotals.outboundClicks,
  );

  const tableWrapperAttrs = reorderEnabled
    ? {
        "x-data": `booksTableReorder(${JSON.stringify(books.map((book) => book.id))}, ${JSON.stringify(creatorId)})`,
      }
    : {};

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
        <span class="font-semibold text-on-surface-strong">All time:</span>{" "}
        {catalogueTotals.views.toLocaleString()} views ·{" "}
        {catalogueTotals.favorites.toLocaleString()} favorited ·{" "}
        {catalogueTotals.outboundClicks.toLocaleString()} outbound clicks
        {clickRateLabel ? ` (${clickRateLabel} click rate)` : null} for{" "}
        {creator.displayName}&apos;s catalogue
      </div>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="creator-books-table"
          action={`/dashboard/admin/creators/${creatorId}`}
          placeholder="Filter books..."
        />
        <Link href="/dashboard/admin/books/create">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
      </div>
      <div {...tableWrapperAttrs}>
        <Table id="creator-books-table">
          <Table.Head>
            <tr>
              {reorderEnabled ? (
                <Table.HeadRow>
                  <span class="sr-only">Reorder</span>
                </Table.HeadRow>
              ) : null}
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Title</Table.HeadRow>
              <Table.HeadRow>Artist</Table.HeadRow>
              <Table.HeadRow>Publisher</Table.HeadRow>
              <Table.HeadRow>Views</Table.HeadRow>
              <Table.HeadRow>Favorited</Table.HeadRow>
              <Table.HeadRow>Outbound clicks</Table.HeadRow>
              <Table.HeadRow>Release Date</Table.HeadRow>
              <Table.HeadRow>Publish</Table.HeadRow>
              <Table.HeadRow>Actions</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body
            id={targetId}
            xMerge={reorderEnabled ? undefined : "append"}
          >
            {books.map((book) => (
              <BookTableRow
                book={book}
                user={user}
                funnel={funnelCounts.get(book.id) ?? emptyFunnel}
                reorderEnabled={reorderEnabled}
              />
            ))}
          </Table.Body>
        </Table>
      </div>
      {!reorderEnabled && totalPages > 1 ? (
        <ListNavigation
          isInfiniteScroll
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      ) : null}
    </div>
  );
};

export default CreatorBookList;

type RowProps = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser;
  funnel: BookFunnelCounts;
  reorderEnabled: boolean;
};

const BookTableRow = ({ book, user, funnel, reorderEnabled }: RowProps) => {
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
      <Table.BodyRow>
        <Link href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${book.publisher?.slug}`}>
          {book.publisher?.displayName ?? ""}
        </Link>
      </Table.BodyRow>
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
        {book.releaseDate
          ? book.releaseDate
              .toISOString()
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/")
          : ""}
      </Table.BodyRow>
      <Table.BodyRow>
        <PublishToggleForm book={book} user={user} />
      </Table.BodyRow>
      <Table.BodyRow>
        <PreviewButton book={book} user={user} />
      </Table.BodyRow>
      <Table.BodyRow>
        <a href={`/dashboard/admin/books/${book.id}`}>
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
        <FormDelete
          action={`/dashboard/admin/books/${book.id}`}
          {...deleteRowAttrs}
        >
          <button type="submit" class="cursor-pointer hover:text-red-500">
            {deleteIcon}
          </button>
        </FormDelete>
      </Table.BodyRow>
    </tr>
  );
};
