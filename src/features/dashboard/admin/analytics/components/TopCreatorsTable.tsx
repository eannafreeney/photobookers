import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import { CreatorType } from "../../../../../db/schema";
import ListNavigation from "../../../../app/components/ListNavigation";
import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import { getTopCreatorsByClicks } from "../../../../purchase-clicks/services";
import WindowTable from "../../components/WindowTable";

type Props = {
  role: Extract<CreatorType, "artist" | "publisher">;
  title: string;
  dateRange: AnalyticsDateRange | null;
  currentPath: string;
  currentPage: number;
  pageParam: string;
};

const TopCreatorsTable = async ({
  role,
  title,
  dateRange,
  currentPath,
  currentPage,
  pageParam,
}: Props) => {
  const [error, result] = await getTopCreatorsByClicks(
    role,
    dateRange,
    currentPage,
  );
  if (error) return <div>{error.reason}</div>;

  const targetId = `analytics-top-${role}s`;

  const { creators, totalPages, page } = result;

  return (
    <div>
      <SectionTitle>{title} by outbound clicks</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Name</Table.HeadRow>
              <Table.HeadRow>Outbound clicks</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} xMerge="append">
            {creators.length === 0 ? (
              <tr>
                <Table.BodyRow>No outbound clicks yet.</Table.BodyRow>
              </tr>
            ) : (
              creators.map((row) => (
                <tr key={row.creatorId}>
                  <Table.BodyRow>
                    {row.coverUrl ? (
                      <img
                        src={row.coverUrl}
                        alt={row.displayName}
                        class="h-12 w-auto"
                      />
                    ) : null}
                  </Table.BodyRow>
                  <Table.BodyRow>
                    <Link href={`/creators/${row.slug}`} target="_blank">
                      {row.displayName}
                    </Link>
                  </Table.BodyRow>
                  <Table.BodyRow>{row.clickCount}</Table.BodyRow>
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
          navId={`pagination-${role}-table`}
        />
      </WindowTable>
    </div>
  );
};

export default TopCreatorsTable;
