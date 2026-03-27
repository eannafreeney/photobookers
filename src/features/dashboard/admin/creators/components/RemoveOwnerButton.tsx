import Button from "../../../../../components/app/Button";
import { deleteIcon } from "../../../../../lib/icons";

type Props = {
  creatorId: string;
};

const RemoveOwnerButton = ({ creatorId }: Props) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": `creator-owner-${creatorId}`,
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };
  return (
    <form
      method="post"
      action={`/dashboard/admin/creators/${creatorId}/remove-owner`}
      {...alpineAttrs}
    >
      <button type="submit" class="cursor-pointer hover:text-red-500">
        {deleteIcon}
      </button>
    </form>
  );
};

export default RemoveOwnerButton;
