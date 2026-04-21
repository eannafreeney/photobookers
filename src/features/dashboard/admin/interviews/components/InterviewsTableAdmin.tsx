import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";
import { formatDate } from "../../../../../utils";
import { getAdminCreatorInterviews } from "../../creators/services";
import Button from "../../../../../components/app/Button";

type Props = {
  currentPath: string;
  currentPage: number;
};

const interviewStatusLabel = (
  status: "published" | "sent" | "completed" | "expired",
) => {
  switch (status) {
    case "published":
      return "Published";
    case "completed":
      return "Completed";
    case "expired":
      return "Expired";
    default:
      return "Sent";
  }
};

const InterviewsTableAdmin = async ({ currentPath, currentPage }: Props) => {
  const [error, result] = await getAdminCreatorInterviews(currentPage);

  if (error) return <div>Error: {error.reason}</div>;
  if (!result?.interviews) return <div>No interviews found</div>;

  const { interviews, totalPages, page } = result;
  const targetId = "interviews-table-body";

  return (
    <div id="interviews-table-container" class="flex flex-col gap-4">
      <SectionTitle>Creator Interviews</SectionTitle>

      <Table id="interviews-table">
        <Table.Head>
          <tr>
            <Table.HeadRow>Creator</Table.HeadRow>
            <Table.HeadRow>Recipient</Table.HeadRow>
            <Table.HeadRow>Status</Table.HeadRow>
            <Table.HeadRow>Sent</Table.HeadRow>
            <Table.HeadRow>Completed</Table.HeadRow>
            <Table.HeadRow>Promo image</Table.HeadRow>

            <Table.HeadRow>Actions</Table.HeadRow>
          </tr>
        </Table.Head>

        <Table.Body id={targetId} xMerge="append">
          {interviews.map((interview) => (
            <tr key={interview.id}>
              <Table.BodyRow>
                <Link href={`/interviews/${interview.id}`} target="_blank">
                  {interview.creator.displayName}
                </Link>
              </Table.BodyRow>
              <Table.BodyRow>{interview.recipientEmail}</Table.BodyRow>
              <Table.BodyRow>
                {interviewStatusLabel(interview.status)}
              </Table.BodyRow>
              <Table.BodyRow>
                {interview.invitedAt ? formatDate(interview.invitedAt) : "-"}
              </Table.BodyRow>
              <Table.BodyRow>
                {interview.completedAt
                  ? formatDate(interview.completedAt)
                  : "-"}
              </Table.BodyRow>
              <Table.BodyRow>
                {interview.promoImageUrl ? (
                  <img
                    src={interview.promoImageUrl}
                    alt="Promo"
                    class="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  "-"
                )}
              </Table.BodyRow>
              <Table.BodyRow>
                <a
                  href={`/dashboard/admin/interviews/${interview.id}`}
                  target="_blank"
                >
                  <Button variant="outline" color="inverse">
                    <span>Edit</span>
                  </Button>
                </a>
              </Table.BodyRow>
            </tr>
          ))}
        </Table.Body>
      </Table>

      <InfiniteScroll
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </div>
  );
};

export default InterviewsTableAdmin;
