import Button from "../../../../../components/app/Button";

type Props = {
  creatorId: string;
};

const RemoveOwnerButton = ({ creatorId }: Props) => {
  return (
    <form
      method="post"
      x-target="toast"
      action={`/dashboard/admin/creators/${creatorId}/remove-owner`}
    >
      <Button variant="outline" color="inverse">
        <span>Remove Owner</span>
      </Button>
    </form>
  );
};

export default RemoveOwnerButton;
