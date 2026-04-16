import Pill from "../../../../../components/app/Pill";
import { capitalize } from "../../../../../utils";
import { BookApprovalStatus } from "../../../../../db/schema";

type Props = { approvalStatus: BookApprovalStatus };

const BookApprovalStatusPill = ({ approvalStatus = "pending" }: Props) => {
  return (
    <div id="book-approval-status" class="flex items-center gap-2">
      <Pill
        variant={
          approvalStatus === "approved"
            ? "success"
            : approvalStatus === "rejected"
              ? "danger"
              : "warning"
        }
      >
        {capitalize(approvalStatus)}
      </Pill>
    </div>
  );
};

export default BookApprovalStatusPill;
