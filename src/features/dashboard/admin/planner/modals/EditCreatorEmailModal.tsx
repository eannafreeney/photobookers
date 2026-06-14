import Button from "../../../../../components/app/Button";
import Input from "../../../../../components/forms/Input";

type Props = {
  creatorId: string;
  displayName: string;
  email: string | null;
};

const EditCreatorEmailModal = ({ creatorId, displayName, email }: Props) => {
  const hasEmail = Boolean(email?.trim());

  const alpineAttrs = {
    "x-target": `creator-email-${creatorId} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:success": "$dispatch('dialog:close')",
  };

  return (
    <>
      <p class="text-sm text-on-surface">
        {hasEmail
          ? `Update the email for ${displayName}.`
          : `Add an email for ${displayName} so spotlight notifications can be sent.`}
      </p>
      <form
        method="post"
        action={`/dashboard/admin/planner/creators/${creatorId}/edit-email`}
        class="flex flex-col gap-3"
        x-data={`{ 'form.email': ${JSON.stringify(email ?? "")} }`}
        {...alpineAttrs}
      >
        <Input
          label="Email"
          type="email"
          name="form.email"
          required
          autofocus
        />
        <Button variant="solid" color="primary">
          Save email
        </Button>
      </form>
    </>
  );
};

export default EditCreatorEmailModal;
