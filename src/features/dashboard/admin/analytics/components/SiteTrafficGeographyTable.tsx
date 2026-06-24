import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import WindowTable from "../../components/WindowTable";
import type { SiteTrafficDataProps } from "./siteTrafficShared";
import { SiteTrafficEmptyTable } from "./siteTrafficShared";

const SiteTrafficGeographyTable = ({ data }: SiteTrafficDataProps) => {
  const { geography } = data;

  if (geography.length === 0) {
    return (
      <SiteTrafficEmptyTable
        title="Geography"
        columns={["Country", "Sessions", "Users"]}
        emptyMessage="No geography data for this period."
      />
    );
  }

  return (
    <div>
      <SectionTitle>Geography</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Country</Table.HeadRow>
              <Table.HeadRow>Sessions</Table.HeadRow>
              <Table.HeadRow>Users</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            {geography.map((row) => (
              <tr key={row.country}>
                <Table.BodyRow>{row.country}</Table.BodyRow>
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

export default SiteTrafficGeographyTable;
