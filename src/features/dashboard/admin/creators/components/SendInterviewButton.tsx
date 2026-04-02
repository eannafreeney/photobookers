import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import { Creator } from "../../../../../db/schema";

const SendInterviewButton = ({ creator }: { creator: Creator }) => {
  if (creator.status !== "verified") {
    return <Badge variant="warning">Not Verified</Badge>;
  }

  const id = `send-interview-${creator.id}`;

  if (creator.interviewEmailSent) {
    return (
      <div id={id}>
        <Badge variant="success">Email Sent</Badge>
      </div>
    );
  }

  const alpineAttrs = {
    "x-target": id,
    "x-target.error": "toast",
    "@ajax:before":
      "confirm('Send interview invite?') || $event.preventDefault()",
  };

  return (
    <form
      id={id}
      method="post"
      action={`/dashboard/admin/creators/${creator.id}/send-interview`}
      {...alpineAttrs}
    >
      <Button variant="outline" color="inverse">
        <span>Send Interview</span>
      </Button>
    </form>
  );
};

export default SendInterviewButton;
