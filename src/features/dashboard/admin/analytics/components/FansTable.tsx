import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import { getAllFans } from "../../../../book-analytics/audience";
import { formatDate } from "../../../../../utils";
import ListNavigation from "../../../../app/components/ListNavigation";
import WindowTable from "../../components/WindowTable";

type Props = {
  currentPage: number;
  currentPath: string;
};

function fanDisplayName(fan: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const fullName = [fan.firstName, fan.lastName].filter(Boolean).join(" ").trim();
  return fullName || fan.email;
}

const FansTable = async ({ currentPage, currentPath }: Props) => {
  const [error, result] = await getAllFans(currentPage);
  if (error) return <div>{error.reason}</div>;

  const targetId = "analytics-fans-table";
  const { fans, totalPages, page } = result;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Fans</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Name</Table.HeadRow>
              <Table.HeadRow>Email</Table.HeadRow>
              <Table.HeadRow>Joined</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} xMerge="append">
            {fans.length === 0 ? (
              <tr>
                <Table.BodyRow>No fans yet.</Table.BodyRow>
              </tr>
            ) : (
              fans.map((fan) => (
                <tr key={fan.id}>
                  <Table.BodyRow>
                    <Link href={`/dashboard/admin/users/${fan.id}`}>
                      {fanDisplayName(fan)}
                    </Link>
                  </Table.BodyRow>
                  <Table.BodyRow>{fan.email}</Table.BodyRow>
                  <Table.BodyRow>{formatDate(fan.createdAt)}</Table.BodyRow>
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

export default FansTable;
