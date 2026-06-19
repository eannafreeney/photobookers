import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import { CreatorType } from "../../../../../db/schema";
import ListNavigation from "../../../../app/components/ListNavigation";
import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import { getTopCreatorsByClicks } from "../../../../purchase-clicks/services";

type Props = {
  role: Extract<CreatorType, "artist" | "publisher">;
  title: string;
  dateRange: AnalyticsDateRange | null;
  currentPath: string;
};

const TopCreatorsTable = async ({
  role,
  title,
  dateRange,
  currentPath,
}: Props) => {
  const [error, result] = await getTopCreatorsByClicks(role, dateRange);
  if (error) return <div>{error.reason}</div>;

  const targetId = `analytics-top-${role}s`;

  const { creators, totalPages, page } = result;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>{title} by outbound clicks</SectionTitle>
      <Table id={targetId}>
        <Table.Head>
          <tr>
            <Table.HeadRow>Cover</Table.HeadRow>
            <Table.HeadRow>Name</Table.HeadRow>
            <Table.HeadRow>Outbound clicks</Table.HeadRow>
          </tr>
        </Table.Head>
        <Table.Body>
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
        currentPath={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </div>
  );
};

export default TopCreatorsTable;
