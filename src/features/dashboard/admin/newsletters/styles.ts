import type { CSSProperties } from "react";

/** ~600px email / 3 columns. Inline-block wraps to stack without @media (Gmail-safe). */
export const FEATURE_COL_MAX_WIDTH = "190px";

export const featureColWrapperStyle: CSSProperties = {
  display: "inline-block",
  width: "100%",
  maxWidth: FEATURE_COL_MAX_WIDTH,
  verticalAlign: "top",
  boxSizing: "border-box",
  fontSize: "14px",
  lineHeight: "1.5",
  textAlign: "center",
  marginBottom: "24px",
};

/** font-size:0 removes horizontal gaps between inline-block cols; avoid line-height:0 — it collapses stacked rows. */
export const gridRowCellStyle: CSSProperties = {
  textAlign: "center",
  fontSize: 0,
};

export const responsiveStyles = "";
