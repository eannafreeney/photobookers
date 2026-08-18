import Button from "@/components/app/Button";
import FormDelete from "@/components/forms/FormDelete";

type Props = {
  action: string;
};

const DeleteRowButton = ({ action }: Props) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Delete this list?') || $event.preventDefault()",
  };
  return (
    <FormDelete action={action} {...alpineAttrs}>
      <Button variant="outline" color="danger" width="fit">
        Delete
      </Button>
    </FormDelete>
  );
};

export default DeleteRowButton;
