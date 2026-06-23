import Link from "../../../../components/app/Link";
import SectionTitle from "../../../../components/app/SectionTitle";
import Table from "../../../../components/app/Table";
import ListNavigation from "../../../app/components/ListNavigation";
import WindowTable from "./WindowTable";

type TopBookByFavoritesRow = {
  bookId: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  favoriteCount: number;
  artistName: string | null;
  publisherName: string | null;
};

type Props = {
  currentPath: string;
  pageParam: string;
  books: TopBookByFavoritesRow[];
  totalPages: number;
  page: number;
  targetId: string;
  navId: string;
};

const TopBooksByFavoritesTable = async ({
  currentPath,
  pageParam,
  books,
  totalPages,
  page,
  targetId,
  navId,
}: Props) => {
  return (
    <div>
      <SectionTitle>Top books by favorites</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Title</Table.HeadRow>
              <Table.HeadRow>Artist</Table.HeadRow>
              <Table.HeadRow>Publisher</Table.HeadRow>
              <Table.HeadRow>Favorites</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} xMerge="append">
            {books.length === 0 ? (
              <tr>
                <Table.BodyRow>No favorites yet.</Table.BodyRow>
              </tr>
            ) : (
              books.map((row) => (
                <tr key={row.bookId}>
                  <Table.BodyRow>
                    {row.coverUrl ? (
                      <img
                        src={row.coverUrl}
                        alt={row.title}
                        class="h-12 w-auto"
                      />
                    ) : null}
                  </Table.BodyRow>
                  <Table.BodyRow>
                    <Link href={`/books/${row.slug}`} target="_blank">
                      {row.title}
                    </Link>
                  </Table.BodyRow>
                  <Table.BodyRow>{row.artistName ?? ""}</Table.BodyRow>
                  <Table.BodyRow>{row.publisherName ?? ""}</Table.BodyRow>
                  <Table.BodyRow>{row.favoriteCount}</Table.BodyRow>
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
          navId={navId}
        />
      </WindowTable>
    </div>
  );
};

export default TopBooksByFavoritesTable;
