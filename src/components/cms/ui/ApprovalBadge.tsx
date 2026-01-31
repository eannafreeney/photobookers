import { capitalize } from "../../../utils";
import Badge from "../../app/Badge";

type Props = {
  approvalStatus: "pending" | "approved" | "rejected";
};

const ApprovalBadge = ({ approvalStatus }: Props) => {
  if (!approvalStatus) return null;
  const badgeVariants = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  } as const;

  return (
    <Badge
      variant={badgeVariants[approvalStatus as keyof typeof badgeVariants]}
    >
      {capitalize(approvalStatus)}
    </Badge>
  );
};
export default ApprovalBadge;
