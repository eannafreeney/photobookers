import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import { formatEngagementRate } from "../../../../site-analytics/format";
import WindowTable from "../../components/WindowTable";
import type { SiteTrafficDataProps } from "./siteTrafficShared";
import { SiteTrafficEmptyTable } from "./siteTrafficShared";

const SiteTrafficLandingPagesTable = ({ data }: SiteTrafficDataProps) => {
  const { landingPages } = data;

  if (landingPages.length === 0) {
    return (
      <SiteTrafficEmptyTable
        title="Landing pages"
        columns={[
          "Landing page",
          "Sessions",
          "Engaged sessions",
          "Engagement rate",
        ]}
        emptyMessage="No landing page data for this period."
      />
    );
  }

  return (
    <div>
      <SectionTitle>Landing pages</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Landing page</Table.HeadRow>
              <Table.HeadRow>Sessions</Table.HeadRow>
              <Table.HeadRow>Engaged sessions</Table.HeadRow>
              <Table.HeadRow>Engagement rate</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            {landingPages.map((row) => (
              <tr key={row.landingPage}>
                <Table.BodyRow>
                  <span class="block max-w-md truncate">{row.landingPage}</span>
                </Table.BodyRow>
                <Table.BodyRow>{row.sessions.toLocaleString()}</Table.BodyRow>
                <Table.BodyRow>
                  {row.engagedSessions.toLocaleString()}
                </Table.BodyRow>
                <Table.BodyRow>
                  {formatEngagementRate(row.engagementRate)}
                </Table.BodyRow>
              </tr>
            ))}
          </Table.Body>
        </Table>
      </WindowTable>
    </div>
  );
};

export default SiteTrafficLandingPagesTable;
