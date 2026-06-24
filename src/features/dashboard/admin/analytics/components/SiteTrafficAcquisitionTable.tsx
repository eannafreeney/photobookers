import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import WindowTable from "../../components/WindowTable";
import type { SiteTrafficDataProps } from "./siteTrafficShared";
import { SiteTrafficEmptyTable } from "./siteTrafficShared";

const SiteTrafficAcquisitionTable = ({ data }: SiteTrafficDataProps) => {
  const { acquisition } = data;

  if (acquisition.length === 0) {
    return (
      <SiteTrafficEmptyTable
        title="Traffic acquisition"
        columns={["Channel", "Source", "Medium", "Sessions", "Users"]}
        emptyMessage="No acquisition data for this period."
      />
    );
  }

  return (
    <div>
      <SectionTitle>Traffic acquisition</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Channel</Table.HeadRow>
              <Table.HeadRow>Source</Table.HeadRow>
              <Table.HeadRow>Medium</Table.HeadRow>
              <Table.HeadRow>Sessions</Table.HeadRow>
              <Table.HeadRow>Users</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            {acquisition.map((row) => (
              <tr key={`${row.channelGroup}-${row.source}-${row.medium}`}>
                <Table.BodyRow>{row.channelGroup}</Table.BodyRow>
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

export default SiteTrafficAcquisitionTable;
