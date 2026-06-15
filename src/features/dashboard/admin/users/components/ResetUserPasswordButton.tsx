import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";

type Props = {
  userId: string;
};

const ResetUserPasswordButton = ({ userId }: Props) => {
  const alpineAttrs = {
    "x-target": "modal-root toast",
    "x-target.error": "toast",
    "@ajax:before":
      "confirm('Generate a new temporary password? The user must change it on next login.') || $event.preventDefault()",
  };

  return (
    <FormPost
      action={`/dashboard/admin/users/${userId}/reset-password`}
      {...alpineAttrs}
    >
      <Button variant="outline" color="warning" type="submit" width="auto">
        Reset password
      </Button>
    </FormPost>
  );
};

export default ResetUserPasswordButton;
