import { jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../../components/app/Pill.js";
import { capitalize } from "../../../../utils.js";
const CreatorStatusBadge = ({ creatorStatus }) => {
  const pillVariants = {
    stub: "warning",
    verified: "success",
    suspended: "info",
    deleted: "danger"
  };
  return /* @__PURE__ */ jsx(Pill, { variant: pillVariants[creatorStatus], children: capitalize(creatorStatus) });
};
var CreatorStatusBadge_default = CreatorStatusBadge;
export {
  CreatorStatusBadge_default as default
};
