import { CreatorStatus } from "../../../../db/schema";
import Badge from "../../../../components/app/Badge";
import { capitalize } from "../../../../utils";

type Props = {
  creatorStatus: CreatorStatus;
};

const CreatorStatusBadge = ({ creatorStatus }: Props) => {
  const badgeVariants = {
    stub: "warning",
    verified: "success",
    suspended: "info",
    deleted: "danger",
  } as const;

  return (
    <Badge variant={badgeVariants[creatorStatus]}>
      {capitalize(creatorStatus)}
    </Badge>
  );
};

export default CreatorStatusBadge;
