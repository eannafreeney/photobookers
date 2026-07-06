import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import { capitalize } from "../../../utils.js";
const GroupCard = ({ tag, href, coverUrl }) => /* @__PURE__ */ jsxs(View, { style: "group-card", children: [
  /* @__PURE__ */ jsx(Behavior, { href }),
  coverUrl ? /* @__PURE__ */ jsx(Image, { source: coverUrl, style: "group-card-image", "resize-mode": "cover" }) : /* @__PURE__ */ jsx(View, { style: "group-card-placeholder" }),
  /* @__PURE__ */ jsx(View, { style: "group-card-overlay", children: /* @__PURE__ */ jsx(Text, { style: "group-card-name", children: capitalize(tag) }) })
] });
var GroupCard_default = GroupCard;
const groupCardStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "group-card",
      width: 220,
      height: 256,
      borderRadius: 0,
      overflow: "hidden",
      marginRight: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "group-card-image", width: 220, height: 256 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "group-card-placeholder",
      width: 220,
      height: 256,
      backgroundColor: "#f0ede8",
      borderWidth: 2,
      borderColor: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "group-card-overlay",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.55)",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "group-card-name",
      fontFamily: "Fraunces-Medium",
      fontSize: 28,
      letterSpacing: 2,
      color: "#fbfaf7",
      textAlign: "center"
    }
  )
] });
export {
  GroupCard_default as default,
  groupCardStyles
};
