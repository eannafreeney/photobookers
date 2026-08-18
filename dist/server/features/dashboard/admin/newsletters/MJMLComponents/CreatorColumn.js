import { jsx, jsxs } from "react/jsx-runtime";
import { MjmlColumn, MjmlImage, MjmlText, MjmlButton } from "mjml-react";
import {
  brand,
  newsletterThreeColContentWidthPx,
  resolveAppBaseUrl
} from "../constants.js";
const CreatorColumn = ({
  creator
}) => {
  const avatarPx = newsletterThreeColContentWidthPx;
  return /* @__PURE__ */ jsxs(MjmlColumn, { verticalAlign: "bottom", children: [
    creator.coverUrl ? /* @__PURE__ */ jsx(
      MjmlImage,
      {
        src: creator.coverUrl,
        alt: creator.displayName,
        width: `${avatarPx}px`,
        height: `${avatarPx}px`,
        borderRadius: `${Math.floor(avatarPx / 2)}px`,
        align: "center",
        padding: "12px 8px 16px"
      }
    ) : null,
    /* @__PURE__ */ jsx(
      MjmlText,
      {
        align: "center",
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: "1.25",
        color: brand.onSurfaceStrong,
        padding: "0 8px 12px",
        fontFamily: brand.fontDisplay,
        children: creator.displayName
      }
    ),
    /* @__PURE__ */ jsx(
      MjmlButton,
      {
        href: `${resolveAppBaseUrl()}/creators/${creator.slug}`,
        backgroundColor: "#ffffff",
        color: brand.onSurfaceStrong,
        border: `1px solid ${brand.outlineStrong}`,
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        borderRadius: "4px",
        innerPadding: "10px 16px",
        align: "center",
        padding: "0 8px 16px",
        children: "View"
      }
    )
  ] });
};
export {
  CreatorColumn
};
