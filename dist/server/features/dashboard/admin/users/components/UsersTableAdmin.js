import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import TableSearch from "../../../../../components/app/TableSearch.js";
import Link from "../../../../../components/app/Link.js";
import Button from "../../../../../components/app/Button.js";
import Table from "../../../../../components/app/Table.js";
import { getAllUsersAdmin } from "../services.js";
import CreatorStatusBadge from "../../components/CreatorStatusBadge.js";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import { deleteIcon } from "../../../../../lib/icons.js";
import ResetUserPasswordButton from "./ResetUserPasswordButton.js";
const UsersTableAdmin = async ({
  searchQuery,
  currentPage,
  currentPath
}) => {
  const [error, result] = await getAllUsersAdmin(searchQuery, currentPage);
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const { users, totalPages, page } = result;
  const targetId = "users-table-body";
  const alpineAttrs = {
    "x-init": "true",
    "@users:updated.window": "$ajax('/dashboard/admin/users', { target: 'users-table-container' })"
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "x-data": "{ selectedCount: 0 }",
      id: "users-table-container",
      class: "flex flex-col gap-4",
      children: [
        /* @__PURE__ */ jsx(SectionTitle, { children: "Users" }),
        /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsx(
            TableSearch,
            {
              target: "users-table-container",
              action: "/dashboard/admin/users",
              placeholder: "Filter users..."
            }
          ),
          /* @__PURE__ */ jsx(Link, { href: "/dashboard/users/new", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "New" }) })
        ] }),
        /* @__PURE__ */ jsxs(Table, { id: "users-table", children: [
          /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Table.HeadRow, { children: " " }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Name" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Email" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Creator Profile" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Creator Status" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(Table.Body, { id: targetId, ...alpineAttrs, xMerge: "append", children: users.map((user) => /* @__PURE__ */ jsx(UserTableRow, { user }, user.id)) })
        ] }),
        /* @__PURE__ */ jsx(
          InfiniteScroll,
          {
            baseUrl: currentPath,
            page,
            totalPages,
            targetId
          }
        ),
        /* @__PURE__ */ jsx(DeleteMultipleUsersForm, {})
      ]
    }
  );
};
var UsersTableAdmin_default = UsersTableAdmin;
const UserTableRow = ({ user }) => {
  if (!user) return /* @__PURE__ */ jsx(Fragment, {});
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()"
  };
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        form: "users-table-form",
        name: "ids",
        value: user.id,
        class: "cursor-pointer"
      }
    ) }),
    /* @__PURE__ */ jsxs(Table.BodyRow, { children: [
      user.firstName,
      " ",
      user.lastName
    ] }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: user.email }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${user.creators[0]?.slug}`, target: "_blank", children: user.creators[0]?.displayName }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${user.creators[0]?.slug}`, target: "_blank", children: user.creators[0]?.status && /* @__PURE__ */ jsx(CreatorStatusBadge, { creatorStatus: user.creators[0]?.status }) }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Link, { href: `/dashboard/admin/users/${user.id}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: /* @__PURE__ */ jsx("span", { children: "View" }) }) }),
      /* @__PURE__ */ jsx(ResetUserPasswordButton, { userId: user.id })
    ] }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      FormDelete,
      {
        action: `/dashboard/admin/users/${user.id}`,
        ...alpineAttrs,
        children: /* @__PURE__ */ jsx("button", { type: "submit", class: "cursor-pointer hover:text-red-500", children: deleteIcon })
      }
    ) })
  ] });
};
const DeleteMultipleUsersForm = () => {
  const deleteAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('form').remove()"
  };
  return /* @__PURE__ */ jsx(
    "form",
    {
      "x-ref": "form",
      id: "users-table-form",
      method: "post",
      action: "/dashboard/admin/users/delete-multiple",
      ...deleteAttrs,
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "danger", type: "submit", children: "Delete" })
    }
  );
};
export {
  UsersTableAdmin_default as default
};
