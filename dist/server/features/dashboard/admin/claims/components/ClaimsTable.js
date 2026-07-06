import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import { getClaimsPendingAdminReview } from "../services.js";
import Table from "../../../../../components/app/Table.js";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
const ClaimsTableAdmin = async () => {
  const claims = await getClaimsPendingAdminReview();
  const targetId = "claims-table-body";
  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@claims:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/claims', { target: 'claims-table-body' })`
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Claims Pending Admin Review" }),
    /* @__PURE__ */ jsxs(Table, { id: "claims-table", children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "User Profile" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "User Email" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Creator Profile" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Claimed At" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Verification URL" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { id: targetId, ...tableBodyAttrs, children: claims.map((claim) => /* @__PURE__ */ jsx(
        ClaimsTableRow,
        {
          claim: claim.claim,
          creator: claim.creator,
          user: claim.user
        }
      )) })
    ] })
  ] });
};
var ClaimsTable_default = ClaimsTableAdmin;
const ClaimsTableRow = ({ claim, creator, user }) => {
  if (!claim || !claim.id || !claim.creatorId || !user) {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsxs(Table.BodyRow, { children: [
      user?.firstName,
      " ",
      user?.lastName
    ] }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: user.email }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${creator.slug}`, children: creator.displayName }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: claim.requestedAt ? new Date(claim.requestedAt).toLocaleDateString() : "" }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      "a",
      {
        href: claim.verificationUrl ?? "",
        class: "link link-primary",
        target: "_blank",
        children: claim.verificationUrl ?? "No verification URL"
      }
    ) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(ApproveClaimForm, { claim }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(RejectClaimForm, { claim }) })
  ] });
};
const ApproveClaimForm = ({ claim }) => {
  const alpineAttrs = {
    "x-target": "claims-table toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()"
  };
  return /* @__PURE__ */ jsx(
    "form",
    {
      method: "post",
      action: `/dashboard/admin/claims/${claim.id}/approve`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", children: "Approve" })
    }
  );
};
const RejectClaimForm = ({ claim }) => {
  const alpineAttrs = {
    "x-target": "claims-table toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()"
  };
  return /* @__PURE__ */ jsx(
    "form",
    {
      method: "post",
      action: `/dashboard/admin/claims/${claim.id}/reject`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "danger", children: "Reject" })
    }
  );
};
export {
  ClaimsTable_default as default
};
