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
import { deleteIcon } from "../../../../../lib/icons";
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

type CreatorBookListProps = {
  creatorId: string;
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
};

const CreatorBookList = async ({
  creatorId,
  currentPath,
  currentPage,
  searchQuery,
}: CreatorBookListProps) => {
  const user = useUser();
  if (!user) return <div>Error: User not found</div>;
  const [error, result] = await getBooksByCreatorId(
    creatorId,
    currentPage,
    searchQuery,
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
    wishlists: 0,
    collections: 0,
    outboundClicks: 0,
  };
  const clickRateLabel = formatClickRate(
    catalogueTotals.views,
    catalogueTotals.outboundClicks,
  );

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
        <span class="font-semibold text-on-surface-strong">All time:</span>{" "}
        {catalogueTotals.views.toLocaleString()} views ·{" "}
        {catalogueTotals.wishlists.toLocaleString()} wishlists ·{" "}
        {catalogueTotals.collections.toLocaleString()} collections ·{" "}
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
      <Table id="creator-books-table">
        <Table.Head>
          <Table.HeadRow>Cover</Table.HeadRow>
          <Table.HeadRow>Title</Table.HeadRow>
          <Table.HeadRow>Artist</Table.HeadRow>
          <Table.HeadRow>Publisher</Table.HeadRow>
          <Table.HeadRow>Views</Table.HeadRow>
          <Table.HeadRow>Wishlists</Table.HeadRow>
          <Table.HeadRow>Collections</Table.HeadRow>
          <Table.HeadRow>Outbound clicks</Table.HeadRow>
          <Table.HeadRow>Release Date</Table.HeadRow>
          <Table.HeadRow>Publish</Table.HeadRow>
          <Table.HeadRow>Actions</Table.HeadRow>
        </Table.Head>
        <Table.Body id={targetId} xMerge="append">
          {books.map((book) => (
            <BookTableRow
              book={book}
              user={user}
              funnel={funnelCounts.get(book.id) ?? emptyFunnel}
            />
          ))}
        </Table.Body>
      </Table>
      <ListNavigation
        isInfiniteScroll
        currentPath={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </div>
  );
};

export default CreatorBookList;

type RowProps = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser;
  funnel: BookFunnelCounts;
};

const BookTableRow = ({ book, user, funnel }: RowProps) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()",
  };

  return (
    <tr>
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
        <Card.Text>{funnel.wishlists}</Card.Text>
      </Table.BodyRow>
      <Table.BodyRow>
        <Card.Text>{funnel.collections}</Card.Text>
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
          {...alpineAttrs}
        >
          <button type="submit" class="cursor-pointer hover:text-red-500">
            {deleteIcon}
          </button>
        </FormDelete>
      </Table.BodyRow>
    </tr>
  );
};
