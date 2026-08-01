import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Table from "../../../components/app/Table.js";
import Button from "../../../components/app/Button.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import FormDelete from "../../../components/forms/FormDelete.js";
import { formatDate } from "../../../utils.js";
import { listCollectorPosts } from "../../../db/queries.js";
const CollectorPostsTable = async ({ userId }) => {
  const posts = await listCollectorPosts(userId);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Your posts" }),
    /* @__PURE__ */ jsxs(Table, { id: "collector-posts-table", children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Date" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Image" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Body" })
      ] }) }),
      /* @__PURE__ */ jsx(CollectorPostsTableBody, { posts })
    ] })
  ] });
};
const CollectorPostsTableBody = ({ posts }) => /* @__PURE__ */ jsx(Table.Body, { id: "collector-posts-table-body", children: posts.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colspan: 4, class: "px-4 py-6 text-sm text-on-surface text-center", children: "No posts yet. Publish your first post above." }) }) : posts.map((post) => /* @__PURE__ */ jsx(CollectorPostRow, { post })) });
const CollectorPostRow = ({ post }) => {
  const dateLabel = post.createdAt ? formatDate(new Date(post.createdAt)) : "\u2014";
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx(Table.BodyRow, { children: dateLabel }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: post.imageUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: post.imageUrl,
        alt: "Post image",
        class: "h-12 w-12 rounded-radius border border-outline object-cover"
      }
    ) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "\u2014" }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: post.body.length > 100 ? post.body.slice(0, 100) + "..." : post.body }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("div", { class: "flex items-center justify-end gap-2", children: /* @__PURE__ */ jsx(
      FormDelete,
      {
        action: `/dashboard/posts/${post.id}`,
        ...{
          "x-target": "toast collector-posts-table-body",
          "@ajax:before": "confirm('Delete this post?') || $event.preventDefault()"
        },
        children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "danger", children: /* @__PURE__ */ jsx("span", { children: "Delete" }) })
      }
    ) }) })
  ] });
};
var CollectorPostsTable_default = CollectorPostsTable;
export {
  CollectorPostsTableBody,
  CollectorPostsTable_default as default
};
