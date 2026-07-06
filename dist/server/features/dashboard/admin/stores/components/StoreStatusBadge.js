import { jsx } from "hono/jsx/jsx-runtime";
const StoreStatusBadge = ({ status }) => {
  const badgeClasses = {
    draft: "bg-gray-200 text-gray-700",
    published: "bg-green-200 text-green-800"
  };
  return /* @__PURE__ */ jsx("span", { class: `px-2 py-1 rounded text-xs font-medium ${badgeClasses[status]}`, children: status.charAt(0).toUpperCase() + status.slice(1) });
};
var StoreStatusBadge_default = StoreStatusBadge;
export {
  StoreStatusBadge_default as default
};
