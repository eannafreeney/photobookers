import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import WindowTable from "../../components/WindowTable";
import type { SiteTrafficDashboard } from "../../../../site-analytics/siteTraffic";

type EmptyTableProps = {
  title: string;
  columns: string[];
  emptyMessage: string;
};

export const SiteTrafficEmptyTable = ({
  title,
  columns,
  emptyMessage,
}: EmptyTableProps) => (
  <div>
    <SectionTitle>{title}</SectionTitle>
    <WindowTable>
      <Table>
        <Table.Head>
          <tr>
            {columns.map((column) => (
              <Table.HeadRow key={column}>{column}</Table.HeadRow>
            ))}
          </tr>
        </Table.Head>
        <Table.Body>
          <tr>
            <td
              colspan={columns.length}
              class="px-4 py-2 text-sm text-on-surface"
            >
              {emptyMessage}
            </td>
          </tr>
        </Table.Body>
      </Table>
    </WindowTable>
  </div>
);

export const siteTrafficDisclaimer =
  "Web traffic from Google Analytics; may undercount due to ad blockers. Book metrics above are first-party.";

export type SiteTrafficDataProps = {
  data: SiteTrafficDashboard;
};
