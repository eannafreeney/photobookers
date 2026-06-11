import Pill from "../../../../../components/app/Pill";
import Button from "../../../../../components/app/Button";
import { Creator } from "../../../../../db/schema";

const SendInterviewButton = ({ creator }: { creator: Creator }) => {
  if (creator.email === null) {
    return <Pill variant="warning">No Email</Pill>;
  }

  const id = `send-interview-${creator.id}`;

  if (creator.interviewEmailSent) {
    return (
      <div id={id}>
        <Pill variant="success">Email Sent</Pill>
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
