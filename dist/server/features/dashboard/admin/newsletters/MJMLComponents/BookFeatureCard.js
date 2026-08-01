import { jsx } from "react/jsx-runtime";
import { BookColumn } from "./BookColumn.js";
import { FeatureRow } from "./FeatureRow.js";
const BookFeatureCard = ({ book }) => /* @__PURE__ */ jsx(FeatureRow, { children: /* @__PURE__ */ jsx(BookColumn, { book }) });
export {
  BookFeatureCard
};
