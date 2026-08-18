import { jsx, jsxs } from "react/jsx-runtime";
import { Section, Row, Column } from "@react-email/components";
import { resolveAppBaseUrl } from "../constants.js";
import { BodyCopy } from "./BodyCopy.js";
import { RoundedImage } from "./RoundedImage.js";
import { Title } from "./Title.js";
import { ViewButton } from "./ViewButton.js";
const CreatorFeatureCard = ({
  creator
}) => /* @__PURE__ */ jsx(Section, { className: "mb-12", children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsxs(Column, { children: [
  creator.coverUrl ? /* @__PURE__ */ jsx(RoundedImage, { src: creator.coverUrl, alt: creator.displayName }) : null,
  /* @__PURE__ */ jsx(Title, { children: creator.displayName }),
  creator.blurb ? /* @__PURE__ */ jsx(BodyCopy, { children: creator.blurb }) : null,
  /* @__PURE__ */ jsx(ViewButton, { href: `${resolveAppBaseUrl()}/creators/${creator.slug}` })
] }) }) });
export {
  CreatorFeatureCard
};
