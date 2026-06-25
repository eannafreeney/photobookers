import Button from "../../../../../components/app/Button";
import FormDelete from "../../../../../components/forms/FormDelete";
import { BookStore } from "../../../../../db/schema";

type Props = {
  store: BookStore;
};

const DeleteStoreButton = ({ store }: Props) => {
  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax.success": "$dispatch('stores:updated'), $el.closest('tr').remove()",
  };

  return (
    <FormDelete action={`/dashboard/admin/stores/${store.id}`} {...alpineAttrs}>
      <Button variant="outline" color="danger">
        <span>Delete</span>
      </Button>
    </FormDelete>
  );
};

export default DeleteStoreButton;
