import { jsx } from "hono/jsx/jsx-runtime";
const Table = ({ children, id }) => {
  return /* @__PURE__ */ jsx("div", { class: "overflow-hidden w-full overflow-x-auto border-y-2 border-on-surface-strong bg-surface", children: /* @__PURE__ */ jsx("table", { id, class: "w-full text-left text-sm text-on-surface", children }) });
};
const TableHead = ({ children }) => /* @__PURE__ */ jsx("thead", { class: "border-b border-outline-strong text-on-surface-strong", children });
const TableHeadRow = ({ children }) => /* @__PURE__ */ jsx("th", { class: "p-4 kicker", children });
const TableBody = ({
  children,
  id,
  xMerge = "replace",
  ...props
}) => /* @__PURE__ */ jsx("tbody", { id, class: "divide-y divide-outline", "x-merge": xMerge, ...props, children });
const TableBodyRow = ({ children }) => /* @__PURE__ */ jsx("td", { class: "px-4 py-2", children });
Table.Head = TableHead;
Table.HeadRow = TableHeadRow;
Table.Body = TableBody;
Table.BodyRow = TableBodyRow;
var Table_default = Table;
export {
  TableBodyRow,
  TableHeadRow,
  Table_default as default
};
