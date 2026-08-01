import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Table from "../../../../components/app/Table.js";
import Link from "../../../../components/app/Link.js";
import Button from "../../../../components/app/Button.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import { formatDate } from "../../../../utils.js";
import { getMessagesByCreator } from "../services.js";
import DeleteMessageForm from "./DeleteMessageForm.js";
const MessagesTable = async ({ creatorId }) => {
  const [error, result] = await getMessagesByCreator(creatorId);
  const messages = error || !result ? [] : result.messages;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Your posts" }),
    /* @__PURE__ */ jsxs(Table, { id: "messages-table", children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Date" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Image" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Body" })
      ] }) }),
      /* @__PURE__ */ jsx(MessagesTableBody, { creatorId, messages })
    ] })
  ] });
};
const MessagesTableBody = ({ creatorId, messages }) => /* @__PURE__ */ jsx(Table.Body, { id: "messages-table-body", children: messages.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colspan: 3, class: "px-4 py-6 text-sm text-on-surface text-center", children: "No posts yet. Publish your first post above." }) }) : messages.map((message) => /* @__PURE__ */ jsx(MessageTableRow, { creatorId, message })) });
const MessageTableRow = ({ creatorId, message }) => {
  const editHref = `/dashboard/messages/${creatorId}/${message.id}`;
  const dateLabel = message.createdAt ? formatDate(new Date(message.createdAt)) : "\u2014";
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: editHref, xTarget: "modal-root", hoverUnderline: true, children: dateLabel }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: message.imageUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: message.imageUrl,
        alt: "Post image",
        class: "h-12 w-12 rounded-radius border border-outline object-cover"
      }
    ) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "\u2014" }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: message.body.length > 100 ? message.body.slice(0, 100) + "..." : message.body }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx("a", { href: editHref, "x-target": "modal-root", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: /* @__PURE__ */ jsx("span", { children: "Edit" }) }) }),
      /* @__PURE__ */ jsx(DeleteMessageForm, { creatorId, messageId: message.id })
    ] }) })
  ] });
};
var MessagesTable_default = MessagesTable;
export {
  MessagesTableBody,
  MessagesTable_default as default
};
