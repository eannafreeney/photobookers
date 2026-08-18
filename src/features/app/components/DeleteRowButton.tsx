import Button from "@/components/app/Button";
import FormDelete from "@/components/forms/FormDelete";

type Props = {
  action: string;
  confirm: string;
} & Record<string, unknown>;

const DeleteRowButton = ({ action, confirm, ...alpineAttrs }: Props) => {
  return (
    <FormDelete
      action={action}
      {...{
        "x-target": "toast",
        "x-target.error": "toast",
        ...alpineAttrs,
        "@ajax:before": `confirm(${JSON.stringify(confirm)}) || $event.preventDefault()`,
      }}
    >
      <Button variant="outline" color="danger" width="fit">
        Delete
      </Button>
    </FormDelete>
  );
};

export default DeleteRowButton;
