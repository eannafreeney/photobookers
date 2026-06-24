import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import WindowTable from "../../components/WindowTable";
import type { SiteTrafficDataProps } from "./siteTrafficShared";
import { SiteTrafficEmptyTable } from "./siteTrafficShared";

const SiteTrafficCampaignsTable = ({ data }: SiteTrafficDataProps) => {
  const { campaigns } = data;

  if (campaigns.length === 0) {
    return (
      <SiteTrafficEmptyTable
        title="Campaigns (UTM)"
        columns={["Campaign", "Source", "Medium", "Sessions", "Users"]}
        emptyMessage="No campaign traffic for this period."
      />
    );
  }

  return (
    <div>
      <SectionTitle>Campaigns (UTM)</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Campaign</Table.HeadRow>
              <Table.HeadRow>Source</Table.HeadRow>
              <Table.HeadRow>Medium</Table.HeadRow>
              <Table.HeadRow>Sessions</Table.HeadRow>
              <Table.HeadRow>Users</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            {campaigns.map((row) => (
              <tr key={`${row.campaign}-${row.source}-${row.medium}`}>
                <Table.BodyRow>{row.campaign}</Table.BodyRow>
                <Table.BodyRow>{row.source}</Table.BodyRow>
                <Table.BodyRow>{row.medium}</Table.BodyRow>
                <Table.BodyRow>{row.sessions.toLocaleString()}</Table.BodyRow>
                <Table.BodyRow>{row.totalUsers.toLocaleString()}</Table.BodyRow>
              </tr>
            ))}
          </Table.Body>
        </Table>
      </WindowTable>
    </div>
  );
};

export default SiteTrafficCampaignsTable;
