import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import APIButton from "../../api/components/APIButton.js";
import { canClaimCreator } from "../../../lib/permissions.js";
import { getPendingClaim } from "../services.js";
const ClaimCreatorBtn = async ({ creator, user, currentPath }) => {
  const isStubAcc = creator.status === "stub";
  const hasCreatorAccount = user?.creator?.id;
  const isAdmin = user?.isAdmin;
  if (!isStubAcc || hasCreatorAccount || isAdmin) return /* @__PURE__ */ jsx(Fragment, {});
  const [_, pendingClaim] = await getPendingClaim(user?.id ?? "", creator.id);
  const hasPendingClaim = user != null && pendingClaim !== null;
  const id = `claim-${creator.id}`;
  const isDisabled = !canClaimCreator(user, creator) || hasPendingClaim;
  const props = {
    id,
    action: currentPath ? `/claims/${creator.id}?currentPath=${encodeURIComponent(currentPath)}` : `/claims/${creator.id}`,
    disabled: isDisabled,
    method: "get",
    tooltipText: "Claim Creator Profile",
    buttonText: "Is this you?",
    currentPath
  };
  return /* @__PURE__ */ jsx(APIButton, { ...props, isDisabled });
};
var ClaimCreatorBtn_default = ClaimCreatorBtn;
export {
  ClaimCreatorBtn_default as default
};
