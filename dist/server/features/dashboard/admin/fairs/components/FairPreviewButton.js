import { jsx } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import { eyeIcon, eyeSlashIcon } from "../../../../../lib/icons.js";
const FairPreviewButton = ({ fairId, slug, status }) => {
  const isPublic = status === "published";
  return /* @__PURE__ */ jsx("div", { id: `fair-preview-${fairId}`, children: /* @__PURE__ */ jsx(
    Link,
    {
      href: `/fairs/${slug}`,
      target: "_blank",
      title: isPublic ? "View fair" : "Preview fair (admin)",
      children: /* @__PURE__ */ jsx("span", { class: "cursor-pointer hover:text-accent", children: isPublic ? eyeIcon() : eyeSlashIcon() })
    }
  ) });
};
var FairPreviewButton_default = FairPreviewButton;
export {
  FairPreviewButton_default as default
};
