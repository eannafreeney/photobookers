import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { buildSpotlightEmailBadgeProps } from "../emailBadgeBuilders.js";
import EmailStatusBadge from "./EmailStatusBadge.js";
const SpotlightEmailStatusBadges = ({
  spotlight,
  row,
  creatorId,
  email
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1.5", children: [
    /* @__PURE__ */ jsx(
      EmailStatusBadge,
      {
        ...buildSpotlightEmailBadgeProps({
          spotlight,
          row,
          creatorId,
          email,
          emailKind: "advance"
        })
      }
    ),
    /* @__PURE__ */ jsx(
      EmailStatusBadge,
      {
        ...buildSpotlightEmailBadgeProps({
          spotlight,
          row,
          creatorId,
          email,
          emailKind: "interview_reminder"
        })
      }
    ),
    /* @__PURE__ */ jsx(
      EmailStatusBadge,
      {
        ...buildSpotlightEmailBadgeProps({
          spotlight,
          row,
          creatorId,
          email,
          emailKind: "feature_day"
        })
      }
    )
  ] });
};
var SpotlightEmailStatusBadges_default = SpotlightEmailStatusBadges;
export {
  SpotlightEmailStatusBadges_default as default
};
