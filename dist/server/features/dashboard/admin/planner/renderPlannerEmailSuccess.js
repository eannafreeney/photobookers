import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import EmailStatusBadge from "./components/EmailStatusBadge.js";
function renderPlannerEmailSuccess(c, creator, badge) {
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Email sent to ${creator.displayName} at ${creator.email}`
        }
      ),
      /* @__PURE__ */ jsx(EmailStatusBadge, { ...badge }),
      dispatchEvents(["planner:updated"])
    ] })
  );
}
export {
  renderPlannerEmailSuccess
};
