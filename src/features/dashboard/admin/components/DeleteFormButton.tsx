import { deleteIcon } from "../../../../lib/icons";

const DeleteFormButton = ({ action }: { action: string }) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };
  return (
    <form method="post" action={action} {...alpineAttrs}>
      <button type="submit" class="cursor-pointer hover:text-red-500">
        {deleteIcon}
      </button>
    </form>
  );
};

export default DeleteFormButton;
