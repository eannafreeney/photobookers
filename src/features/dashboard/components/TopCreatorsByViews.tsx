import Link from "../../../components/app/Link";
import SectionTitle from "../../../components/app/SectionTitle";
import Table from "../../../components/app/Table";
import { CreatorType } from "../../../db/schema";
import { capitalize } from "../../../utils";
import ListNavigation from "../../app/components/ListNavigation";
import type { AnalyticsDateRange } from "../../book-analytics/dateRange";
import {
  getTopCreatorsByViews,
  type TopCreatorsByViewsScope,
} from "../../book-views/services";
import WindowTable from "../admin/components/WindowTable";

type Props = {
  dateRange: AnalyticsDateRange | null;
  currentPath: string;
  currentPage: number;
  pageParam: string;
  scope?: TopCreatorsByViewsScope | null;
};

const TopCreatorsByViews = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam,
  scope,
}: Props) => {
  const [error, result] = await getTopCreatorsByViews(
    dateRange,
    currentPage,
    scope,
  );
  if (error) return <div>{error.reason}</div>;

  const role = scope ?? "creator";
  const targetId = `analytics-top-${role}s-by-views`;
  const title =
    scope === "publisher"
      ? "Top publishers by views"
      : scope === "artist"
        ? "Top artists by views"
        : "Top creators by views";
  const { creators, totalPages, page } = result;

  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Name</Table.HeadRow>
              <Table.HeadRow>Type</Table.HeadRow>
              <Table.HeadRow>Views</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} xMerge="append">
            {creators.length === 0 ? (
              <tr>
                <Table.BodyRow>No creator views yet.</Table.BodyRow>
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
                  <Table.BodyRow>{capitalize(row.type)}</Table.BodyRow>
                  <Table.BodyRow>{row.viewCount}</Table.BodyRow>
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
          navId={`pagination-top-${role}s-by-views-table`}
        />
      </WindowTable>
    </div>
  );
};

export default TopCreatorsByViews;
