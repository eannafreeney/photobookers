import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import { getUserByIdAdmin } from "../services";
import RemoveOwnerButton from "./RemoveOwnerButton";

type Props = {
  ownerUserId?: string | null;
  creatorId: string;
};

const OwnerCell = async ({ ownerUserId, creatorId }: Props) => {
  // if not owned, assign owner button that opens a modal to assign an owner (user)
  if (ownerUserId) {
    const user = await getUserByIdAdmin(ownerUserId);
    return (
      <div id={`creator-owner-${creatorId}`} class="flex items-center gap-2">
        <Link
          href={`/dashboard/admin/users/${ownerUserId}`}
          title={user?.email ?? "Unassigned"}
          className="inline-block max-w-[180px] truncate"
        >
          {user?.email ?? "Unassigned"}
        </Link>
        <RemoveOwnerButton creatorId={creatorId} />
      </div>
    );
  }

  return (
    <a
      id={`creator-owner-${creatorId}`}
      href={`/dashboard/admin/creators/assign-owner/${creatorId}`}
      x-target="modal-root"
    >
      <Button variant="outline" color="inverse">
        <span>Assign Owner</span>
      </Button>
    </a>
  );
};

export default OwnerCell;
