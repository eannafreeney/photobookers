import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";
import { formatDate } from "../../../../../utils";
import { getAdminCreatorInterviews } from "../../creators/services";
import Button from "../../../../../components/app/Button";
import FormDelete from "../../../../../components/forms/FormDelete";
import { deleteIcon } from "../../../../../lib/icons";
import { Creator, CreatorInterview } from "../../../../../db/schema";
import InterviewStatusForm from "./InterviewStatusForm";

type Props = {
  statusType?: "published" | "sent" | "completed" | "expired";
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
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

const InterviewsTableAndFilter = async ({
  currentPath,
  currentPage,
  statusType,
  searchQuery,
}: Props) => {
  const [error, result] = await getAdminCreatorInterviews(
    currentPage,
    searchQuery,
    statusType,
  );

  if (error) return <div>Error: {error.reason}</div>;
  if (!result?.interviews) return <div>No interviews found</div>;

  const { interviews, totalPages, page } = result;
  const targetId = "interviews-table-body";

  return (
    <div x-data>
      <div
        id="interviews-table-container"
        class="flex flex-col gap-4"
        x-ref="paginationContent"
      >
        <InterviewStatusForm statusType={statusType} />
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
              <InterviewTableRow key={interview.id} interview={interview} />
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
    </div>
  );
};

export default InterviewsTableAndFilter;

const InterviewTableRow = ({
  interview,
}: {
  interview: CreatorInterview & { creator: Creator };
}) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()",
  };
  return (
    <tr key={interview.id}>
      <Table.BodyRow>
        <Link href={`/interviews/view/${interview.id}`} target="_blank">
          {interview.creator.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>{interview.recipientEmail}</Table.BodyRow>
      <Table.BodyRow>{interviewStatusLabel(interview.status)}</Table.BodyRow>
      <Table.BodyRow>
        {interview.invitedAt ? formatDate(interview.invitedAt) : "-"}
      </Table.BodyRow>
      <Table.BodyRow>
        {interview.completedAt ? formatDate(interview.completedAt) : "-"}
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
        <a href={`/dashboard/admin/interviews/${interview.id}`} target="_blank">
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        <FormDelete
          action={`/dashboard/admin/interviews/${interview.id}`}
          {...alpineAttrs}
        >
          <button type="submit" class="cursor-pointer hover:text-red-500">
            {deleteIcon}
          </button>
        </FormDelete>
      </Table.BodyRow>
    </tr>
  );
};
