import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
const CreatorSocialLinks = ({
  baseUrl,
  website,
  instagram,
  twitter,
  facebook
}) => {
  const hasSocials = website || instagram || twitter || facebook;
  if (!hasSocials) return null;
  return /* @__PURE__ */ jsxs(View, { style: "creator-socials", children: [
    website && /* @__PURE__ */ jsxs(View, { style: "social-btn", children: [
      /* @__PURE__ */ jsx(
        Image,
        {
          source: `${baseUrl}/icons/social/website.png`,
          style: "social-icon",
          "resize-mode": "contain"
        }
      ),
      /* @__PURE__ */ jsx(Text, { style: "social-label", children: "Website" }),
      /* @__PURE__ */ jsx(Behavior, { action: "deep-link", href: website })
    ] }),
    instagram && /* @__PURE__ */ jsxs(View, { style: "social-btn", children: [
      /* @__PURE__ */ jsx(
        Image,
        {
          source: `${baseUrl}/icons/social/instagram.png`,
          style: "social-icon",
          "resize-mode": "contain"
        }
      ),
      /* @__PURE__ */ jsx(Text, { style: "social-label", children: "Instagram" }),
      /* @__PURE__ */ jsx(
        Behavior,
        {
          action: "deep-link",
          href: `https://instagram.com/${instagram.replace(/^@/, "")}`
        }
      )
    ] }),
    facebook && /* @__PURE__ */ jsxs(View, { style: "social-btn", children: [
      /* @__PURE__ */ jsx(
        Image,
        {
          source: `${baseUrl}/icons/social/facebook.png`,
          style: "social-icon",
          "resize-mode": "contain"
        }
      ),
      /* @__PURE__ */ jsx(Text, { style: "social-label", children: "Facebook" }),
      /* @__PURE__ */ jsx(
        Behavior,
        {
          action: "deep-link",
          href: `https://facebook.com/${facebook.replace(/^@/, "")}`
        }
      )
    ] }),
    twitter && /* @__PURE__ */ jsxs(View, { style: "social-btn", children: [
      /* @__PURE__ */ jsx(
        Image,
        {
          source: `${baseUrl}/icons/social/x.png`,
          style: "social-icon",
          "resize-mode": "contain"
        }
      ),
      /* @__PURE__ */ jsx(Text, { style: "social-label", children: "X" }),
      /* @__PURE__ */ jsx(
        Behavior,
        {
          action: "deep-link",
          href: `https://x.com/${twitter.replace(/^@/, "")}`
        }
      )
    ] })
  ] });
};
var CreatorSocialLinks_default = CreatorSocialLinks;
const creatorSocialStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-socials",
      flexDirection: "row",
      alignItems: "stretch",
      marginTop: 16,
      gap: 8,
      width: "100%"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "social-btn",
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 8,
      paddingRight: 8,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: "#e4e0d5",
      gap: 6
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "social-icon", width: 22, height: 22, flexShrink: 0 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "social-label",
      width: "100%",
      fontSize: 12,
      fontWeight: "600",
      color: "#191613",
      textAlign: "center"
    }
  )
] });
export {
  creatorSocialStyles,
  CreatorSocialLinks_default as default
};
