import Button from "../../../../../components/app/Button";

const DeleteButton = ({ action }: { action: string }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <form
      action={action}
      method="post"
      {...alpineAttrs}
      class="inline-block text-sm font-medium text-danger hover:underline"
    >
      <Button variant="outline" color="danger">
        Delete
      </Button>
    </form>
  );
};

export default DeleteButton;
