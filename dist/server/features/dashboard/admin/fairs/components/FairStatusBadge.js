import { jsx } from "hono/jsx/jsx-runtime";
const FairStatusBadge = ({ status }) => {
  const badgeClasses = {
    draft: "bg-gray-200 text-gray-700",
    published: "bg-green-200 text-green-800",
    cancelled: "bg-red-200 text-red-800"
  };
  return /* @__PURE__ */ jsx("span", { class: `px-2 py-1 rounded text-xs font-medium ${badgeClasses[status]}`, children: status.charAt(0).toUpperCase() + status.slice(1) });
};
var FairStatusBadge_default = FairStatusBadge;
export {
  FairStatusBadge_default as default
};
