import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import WindowTable from "../../components/WindowTable";
import type { SiteTrafficDataProps } from "./siteTrafficShared";
import { SiteTrafficEmptyTable } from "./siteTrafficShared";

const SiteTrafficTopPagesTable = ({ data }: SiteTrafficDataProps) => {
  const { topPages } = data;

  if (topPages.length === 0) {
    return (
      <SiteTrafficEmptyTable
        title="Top pages"
        columns={["Page path", "Page views", "Sessions"]}
        emptyMessage="No page view data for this period."
      />
    );
  }

  return (
    <div>
      <SectionTitle>Top pages</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Page path</Table.HeadRow>
              <Table.HeadRow>Page views</Table.HeadRow>
              <Table.HeadRow>Sessions</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            {topPages.map((row) => (
              <tr key={row.pagePath}>
                <Table.BodyRow>
                  <span class="block max-w-md truncate">{row.pagePath}</span>
                </Table.BodyRow>
                <Table.BodyRow>
                  {row.screenPageViews.toLocaleString()}
                </Table.BodyRow>
                <Table.BodyRow>{row.sessions.toLocaleString()}</Table.BodyRow>
              </tr>
            ))}
          </Table.Body>
        </Table>
      </WindowTable>
    </div>
  );
};

export default SiteTrafficTopPagesTable;
