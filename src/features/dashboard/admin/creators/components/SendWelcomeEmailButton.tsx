import Pill from "../../../../../components/app/Pill";
import Button from "../../../../../components/app/Button";
import { Creator } from "../../../../../db/schema";

const SendWelcomeEmailButton = ({ creator }: { creator: Creator }) => {
  if (creator.status === "verified") return <></>;

  const id = `send-welcome-email-${creator.id}`;

  if (creator.welcomeEmailSent) {
    return (
      <div id={id}>
        <Pill variant="success">Email Sent</Pill>
      </div>
    );
  }

  if (!creator.email) return <Pill variant="danger">No email</Pill>;

  const alpineAttrs = {
    "x-target": id,
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <form
      id={id}
      method="post"
      action={`/dashboard/admin/creators/${creator.id}/send-welcome-email`}
      {...alpineAttrs}
    >
      <Button variant="outline" color="inverse">
        <span>Send Welcome Email</span>
      </Button>
    </form>
  );
};

export default SendWelcomeEmailButton;
