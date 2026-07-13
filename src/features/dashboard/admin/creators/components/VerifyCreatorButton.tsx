import Pill from "../../../../../components/app/Pill";
import Button from "../../../../../components/app/Button";
import { Creator } from "../../../../../db/schema";

const VerifyCreatorButton = ({ creator }: { creator: Creator }) => {
  const id = `verify-creator-${creator.id}`;

  if (creator.status === "verified") {
    return (
      <div id={id}>
        <Pill variant="success">Verified</Pill>
      </div>
    );
  }

  const alpineAttrs = {
    "x-target": id,
    "x-target.error": "toast",
    "@ajax:before": "confirm('Verify this creator profile?') || $event.preventDefault()",
  };

  return (
    <form
      id={id}
      method="post"
      action={`/dashboard/admin/creators/${creator.id}/verify`}
      {...alpineAttrs}
    >
      <Button variant="outline" color="primary">
        <span>Verify</span>
      </Button>
    </form>
  );
};

export default VerifyCreatorButton;
