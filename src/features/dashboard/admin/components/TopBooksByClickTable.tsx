import Table from "../../../../components/app/Table";
import Link from "../../../../components/app/Link";
import ListNavigation from "../../../app/components/ListNavigation";
import WindowTable from "./WindowTable";
import SectionTitle from "../../../../components/app/SectionTitle";

type TopBookByClicksRow = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  clickCount: number;
  artistName: string | null;
  publisherName: string | null;
};

type Props = {
  currentPath: string;
  pageParam: string;
  books: TopBookByClicksRow[];
  totalPages: number;
  page: number;
  targetId?: string;
};

const TopBooksByClickTable = async ({
  currentPath,
  pageParam,
  books,
  totalPages,
  page,
  targetId = "analytics-top-books",
}: Props) => {
  return (
    <div>
      <SectionTitle>Top books by outbound clicks</SectionTitle>
      <WindowTable>
        <Table id="analytics-top-books">
          <Table.Head>
            <tr>
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Title</Table.HeadRow>
              <Table.HeadRow>Artist</Table.HeadRow>
              <Table.HeadRow>Publisher</Table.HeadRow>
              <Table.HeadRow>Outbound clicks</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            {books.length === 0 ? (
              <tr>
                <Table.BodyRow>No outbound clicks yet.</Table.BodyRow>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id}>
                  <Table.BodyRow>
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        class="h-12 w-auto"
                      />
                    ) : null}
                  </Table.BodyRow>
                  <Table.BodyRow>
                    <Link href={`/books/${book.slug}`} target="_blank">
                      {book.title}
                    </Link>
                  </Table.BodyRow>
                  <Table.BodyRow>{book.artistName ?? ""}</Table.BodyRow>
                  <Table.BodyRow>{book.publisherName ?? ""}</Table.BodyRow>
                  <Table.BodyRow>{book.clickCount}</Table.BodyRow>
                </tr>
              ))
            )}
          </Table.Body>
        </Table>
        <ListNavigation
          isInfiniteScroll
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
          pageParam={pageParam}
          navId={`pagination-books-table`}
        />
      </WindowTable>
    </div>
  );
};

export default TopBooksByClickTable;
