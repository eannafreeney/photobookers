import { Context } from "hono";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import EmailStatusBadge, {
  type EmailStatusBadgeProps,
} from "./components/EmailStatusBadge";

export function renderPlannerEmailSuccess(
  c: Context,
  creator: { displayName: string; email: string },
  badge: EmailStatusBadgeProps,
) {
  return c.html(
    <>
      <Alert
        type="success"
        message={`Email sent to ${creator.displayName} at ${creator.email}`}
      />
      <EmailStatusBadge {...badge} />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
}
