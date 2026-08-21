import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import Link from "../../../components/app/Link.js";
import { canClaimCreator } from "../../../lib/permissions.js";
import { getPendingClaim } from "../services.js";
const claimButtonClass = (isDisabled) => clsx(
  "whitespace-nowrap w-full rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center block",
  "bg-transparent text-secondary border-secondary",
  isDisabled && "border-secondary/50 opacity-50 pointer-events-none"
);
const ClaimCreatorBtn = async ({ creator, user, currentPath }) => {
  const isStubAcc = creator.status === "stub";
  const hasCreatorAccount = user?.creator?.id;
  const isAdmin = user?.isAdmin;
  if (!isStubAcc || hasCreatorAccount || isAdmin) return /* @__PURE__ */ jsx(Fragment, {});
  const [_, pendingClaim] = await getPendingClaim(user?.id ?? "", creator.id);
  const hasPendingClaim = user != null && pendingClaim !== null;
  const isDisabled = !canClaimCreator(user, creator) || hasPendingClaim;
  const claimHref = currentPath ? `/claims/${creator.id}/start?currentPath=${encodeURIComponent(currentPath)}` : `/claims/${creator.id}/start`;
  if (isDisabled) {
    return /* @__PURE__ */ jsx("span", { class: claimButtonClass(true), "aria-disabled": "true", children: "Claim profile" });
  }
  return /* @__PURE__ */ jsx(Link, { href: claimHref, className: claimButtonClass(false), children: "Claim profile" });
};
var ClaimCreatorBtn_default = ClaimCreatorBtn;
export {
  ClaimCreatorBtn_default as default
};
