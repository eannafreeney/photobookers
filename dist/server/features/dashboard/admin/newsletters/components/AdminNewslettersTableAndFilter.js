import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll.js";
import Link from "../../../../../components/app/Link.js";
import Table from "../../../../../components/app/Table.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import { deleteIcon, editIcon } from "../../../../../lib/icons.js";
import {
  getNewsletterCampaignRange,
  listNewsletterCampaignsPaginated
} from "../services.js";
import { formatNewsletterWeekRange } from "../utils.js";
import NewsletterStatusPill from "./NewsletterStatusPill.js";
import { deleteRowAttrs } from "../../../../../lib/utils.js";
const AdminNewslettersTableAndFilter = async ({
  currentPage,
  currentPath
}) => {
  const { campaigns, totalPages, page } = await listNewsletterCampaignsPaginated(currentPage);
  const targetId = "newsletters-table-body";
  return /* @__PURE__ */ jsx("div", { "x-data": true, children: /* @__PURE__ */ jsxs("div", { id: "newsletters-table-container", class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs(Table, { id: "newsletters-table", children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Week" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Status" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Sent" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: "append", children: campaigns.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: "text-on-surface", children: "No newsletters yet." }) }) }) : campaigns.map((campaign) => /* @__PURE__ */ jsx(NewslettersTableRow, { campaign }, campaign.id)) })
    ] }),
    /* @__PURE__ */ jsx(
      InfiniteScroll,
      {
        baseUrl: currentPath,
        page,
        totalPages,
        targetId
      }
    )
  ] }) });
};
var AdminNewslettersTableAndFilter_default = AdminNewslettersTableAndFilter;
const NewslettersTableRow = ({
  campaign
}) => {
  const { weekStart, weekEnd } = getNewsletterCampaignRange(campaign);
  const isSent = campaign.status === "sent";
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/dashboard/admin/newsletters/${campaign.id}`, children: formatNewsletterWeekRange(weekStart, weekEnd) }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(NewsletterStatusPill, { status: campaign.status }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: campaign.sentAt ? campaign.sentAt.toLocaleDateString() : "\u2013" }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("a", { href: `/dashboard/admin/newsletters/${campaign.id}`, children: /* @__PURE__ */ jsx("button", { class: "cursor-pointer", children: editIcon() }) }),
      !isSent && /* @__PURE__ */ jsx(
        FormPost,
        {
          action: `/dashboard/admin/newsletters/${campaign.id}/delete`,
          ...deleteRowAttrs,
          children: /* @__PURE__ */ jsx("button", { type: "submit", class: "cursor-pointer hover:text-red-500", children: deleteIcon })
        }
      )
    ] }) })
  ] });
};
export {
  AdminNewslettersTableAndFilter_default as default
};
