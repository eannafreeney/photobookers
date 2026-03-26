import Button from "../../../../../components/app/Button";
import Card from "../../../../../components/app/Card";
import { Creator } from "../../../../../db/schema";

const SendWelcomeEmailButton = ({ creator }: { creator: Creator }) => {
  if (creator.status === "verified") return <></>;

  if (creator.welcomeEmailSent) {
    return <Card.Text>Sent</Card.Text>;
  }

  if (!creator.email) return <Card.Text>No email</Card.Text>;

  const alpineAttrs = {
    "x-target": `send-welcome-email-${creator.id}`,
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <form
      id={`send-welcome-email-${creator.id}`}
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
