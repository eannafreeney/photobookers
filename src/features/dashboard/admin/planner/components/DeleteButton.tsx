import Button from "../../../../../components/app/Button";
import FormDelete from "../../../../../components/forms/FormDelete";

const DeleteButton = ({ action }: { action: string }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <FormDelete
      action={action}
      {...alpineAttrs}
      class="inline-block text-sm font-medium text-danger hover:underline"
    >
      <Button variant="outline" color="danger">
        Delete
      </Button>
    </FormDelete>
  );
};

export default DeleteButton;
