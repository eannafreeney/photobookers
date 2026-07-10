import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import { getAllVerifiedCreators } from "../../../../book-analytics/audience";
import { capitalize, formatDate } from "../../../../../utils";
import ListNavigation from "../../../../app/components/ListNavigation";
import WindowTable from "../../components/WindowTable";

type Props = {
  currentPage: number;
  currentPath: string;
};

const VerifiedCreatorsTable = async ({ currentPage, currentPath }: Props) => {
  const [error, result] = await getAllVerifiedCreators(currentPage);
  if (error) return <div>{error.reason}</div>;

  const targetId = "analytics-verified-creators-table";
  const { creators, totalPages, page } = result;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Verified creators</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Name</Table.HeadRow>
              <Table.HeadRow>Type</Table.HeadRow>
              <Table.HeadRow>Verified</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} xMerge="append">
            {creators.length === 0 ? (
              <tr>
                <Table.BodyRow>No verified creators yet.</Table.BodyRow>
              </tr>
            ) : (
              creators.map((creator) => (
                <tr key={creator.id}>
                  <Table.BodyRow>
                    <Link href={`/creators/${creator.slug}`} target="_blank">
                      {creator.displayName}
                    </Link>
                  </Table.BodyRow>
                  <Table.BodyRow>{capitalize(creator.type)}</Table.BodyRow>
                  <Table.BodyRow>
                    {creator.verifiedAt ? formatDate(creator.verifiedAt) : "—"}
                  </Table.BodyRow>
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
        />
      </WindowTable>
    </div>
  );
};

export default VerifiedCreatorsTable;
