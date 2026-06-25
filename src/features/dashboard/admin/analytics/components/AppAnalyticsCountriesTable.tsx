import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import WindowTable from "../../components/WindowTable";
import type { AppAnalyticsDataProps } from "./appAnalyticsShared";

const AppAnalyticsCountriesTable = ({ data }: AppAnalyticsDataProps) => {
  const { topCountries } = data;

  if (topCountries.length === 0) {
    return (
      <div>
        <SectionTitle>Top countries</SectionTitle>
        <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface shadow-sm">
          No country download data for this period.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>Top countries</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Country</Table.HeadRow>
              <Table.HeadRow>Downloads</Table.HeadRow>
              <Table.HeadRow>First-time</Table.HeadRow>
              <Table.HeadRow>Redownloads</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body>
            {topCountries.map((row) => (
              <tr key={row.countryCode}>
                <Table.BodyRow>{row.countryCode}</Table.BodyRow>
                <Table.BodyRow>{row.downloads.toLocaleString()}</Table.BodyRow>
                <Table.BodyRow>
                  {row.firstTimeDownloads.toLocaleString()}
                </Table.BodyRow>
                <Table.BodyRow>{row.redownloads.toLocaleString()}</Table.BodyRow>
              </tr>
            ))}
          </Table.Body>
        </Table>
      </WindowTable>
    </div>
  );
};

export default AppAnalyticsCountriesTable;
