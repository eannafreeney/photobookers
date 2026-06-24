import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import WindowTable from "../../components/WindowTable";
import type { SiteTrafficDataProps } from "./siteTrafficShared";
import { SiteTrafficEmptyTable } from "./siteTrafficShared";

const SiteTrafficReferrersTable = ({ data }: SiteTrafficDataProps) => {
  const { referrers } = data;

  if (referrers.length === 0) {
    return (
      <SiteTrafficEmptyTable
        title="Referring sites"
        columns={["Source", "Sessions", "Users"]}
        emptyMessage="No referral traffic for this period."
      />
    );
  }

  return (
    <div>
      <SectionTitle>Referring sites</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Source</Table.HeadRow>
              <Table.HeadRow>Sessions</Table.HeadRow>
              <Table.HeadRow>Users</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            {referrers.map((row) => (
              <tr key={row.source}>
                <Table.BodyRow>{row.source}</Table.BodyRow>
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

export default SiteTrafficReferrersTable;
