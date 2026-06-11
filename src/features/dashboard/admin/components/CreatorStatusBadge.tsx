import { CreatorStatus } from "../../../../db/schema";
import Pill from "../../../../components/app/Pill";
import { capitalize } from "../../../../utils";

type Props = {
  creatorStatus: CreatorStatus;
};

const CreatorStatusBadge = ({ creatorStatus }: Props) => {
  const pillVariants = {
    stub: "warning",
    verified: "success",
    suspended: "info",
    deleted: "danger",
  } as const;

  return (
    <Pill variant={pillVariants[creatorStatus]}>
      {capitalize(creatorStatus)}
    </Pill>
  );
};

export default CreatorStatusBadge;
