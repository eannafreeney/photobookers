import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, Text, View } from "../../../lib/hxml-comps.js";
import {
  aboutAudienceSections,
  aboutDifferentiators,
  aboutEditorialLinks,
  aboutPageMeta
} from "../../app/content/aboutPageContent.js";
const AboutContent = () => /* @__PURE__ */ jsxs(View, { style: "about-content", children: [
  /* @__PURE__ */ jsxs(View, { style: "about-section", children: [
    /* @__PURE__ */ jsx(Text, { style: "about-section-title", children: "About" }),
    /* @__PURE__ */ jsx(Text, { style: "about-section-body", children: aboutPageMeta.intro }),
    /* @__PURE__ */ jsx(Text, { style: "about-section-body", children: aboutPageMeta.lead })
  ] }),
  aboutAudienceSections.map((section) => /* @__PURE__ */ jsxs(View, { style: "about-section", children: [
    /* @__PURE__ */ jsx(Text, { style: "about-section-kicker", children: section.kicker }),
    /* @__PURE__ */ jsx(Text, { style: "about-section-title", children: section.title }),
    /* @__PURE__ */ jsx(Text, { style: "about-section-body", children: section.intro }),
    section.bullets.map((bullet, index) => /* @__PURE__ */ jsxs(Text, { style: "about-section-bullet", children: [
      "\u2022 ",
      bullet
    ] }, index)),
    /* @__PURE__ */ jsx(Text, { style: "about-section-body", children: section.closing })
  ] }, section.id)),
  /* @__PURE__ */ jsxs(View, { style: "about-section", children: [
    /* @__PURE__ */ jsx(Text, { style: "about-section-kicker", children: aboutDifferentiators.kicker }),
    /* @__PURE__ */ jsx(Text, { style: "about-section-title", children: aboutDifferentiators.title }),
    /* @__PURE__ */ jsx(Text, { style: "about-section-body", children: aboutDifferentiators.body }),
    aboutDifferentiators.pillars.map((pillar, index) => /* @__PURE__ */ jsxs(View, { style: "about-pillar", children: [
      /* @__PURE__ */ jsx(Text, { style: "about-pillar-title", children: pillar.title }),
      /* @__PURE__ */ jsx(Text, { style: "about-section-body", children: pillar.description })
    ] }, index))
  ] }),
  /* @__PURE__ */ jsxs(View, { style: "about-section", children: [
    /* @__PURE__ */ jsx(Text, { style: "about-section-kicker", children: "Every week" }),
    /* @__PURE__ */ jsx(Text, { style: "about-section-title", children: "An editorial rhythm" }),
    /* @__PURE__ */ jsx(Text, { style: "about-section-body", children: `Every day we feature a ${aboutEditorialLinks[0].label}, and every week an ${aboutEditorialLinks[1].label} and a ${aboutEditorialLinks[2].label}, alongside ${aboutEditorialLinks[3].label} with the people behind the books. The best way to keep up is the ${aboutEditorialLinks[4].label}.` })
  ] })
] });
var AboutContent_default = AboutContent;
const aboutContentStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "about-content",
      flexDirection: "column",
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
      paddingBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "about-section", marginBottom: 24 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "about-section-kicker",
      fontSize: 12,
      color: "#8a8274",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "about-section-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 18,
      color: "#191613",
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "about-section-body",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "about-section-bullet",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 8,
      paddingLeft: 4
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "about-pillar", marginTop: 8, marginBottom: 4 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "about-pillar-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 16,
      color: "#191613",
      marginBottom: 4
    }
  )
] });
export {
  aboutContentStyles,
  AboutContent_default as default
};
