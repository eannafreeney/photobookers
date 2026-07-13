import Button from "../../../../components/app/Button";
import FormDelete from "../../../../components/forms/FormDelete";

type Props = {
  creatorId: string;
  messageId: string;
};

const DeleteMessageForm = ({ creatorId, messageId }: Props) => {
  const alpineAttrs = {
    "x-target": "toast messages-table-body",
    "@ajax:before": "confirm('Delete this post?') || $event.preventDefault()",
    "@ajax:success": "$dispatch('messages:updated')",
  };

  return (
    <FormDelete
      action={`/dashboard/messages/${creatorId}/${messageId}`}
      {...alpineAttrs}
    >
      <Button variant="outline" color="danger">
        <span>Delete</span>
      </Button>
    </FormDelete>
  );
};

export default DeleteMessageForm;
