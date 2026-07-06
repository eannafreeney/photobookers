import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { capitalize } from "../../utils.js";
import Link from "./Link.js";
import { imageSkeletonIcon } from "../../lib/icons.js";
const Card = ({ children, className }) => /* @__PURE__ */ jsx(
  "div",
  {
    class: clsx(
      "group flex flex-col rounded-radius overflow-hidden border border-outline bg-surface text-on-surface hover:border-outline-strong transition-colors duration-300",
      className
    ),
    children
  }
);
const CardHeader = ({ children }) => /* @__PURE__ */ jsx("div", { class: "flex items-center justify-between gap-2 p-2", children });
const CardBody = ({ children, gap = "2" }) => /* @__PURE__ */ jsx("div", { class: `flex flex-col gap-${gap} px-3 py-3 justify-between`, children });
const CardImage = ({
  src,
  alt,
  href,
  aspectSquare = false,
  objectCover = false,
  coverLandscapeAndSquare = false
}) => /* @__PURE__ */ jsxs(
  "figure",
  {
    "x-data": "imageOrientation()",
    class: clsx(
      "relative w-full overflow-hidden bg-surface-alt",
      aspectSquare ? "aspect-square" : "aspect-[1]"
    ),
    ...coverLandscapeAndSquare && { "data-cover-square": "true" },
    ...aspectSquare && { "data-aspect-square": "true" },
    ...objectCover && { "data-object-cover": "true" },
    children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          class: "absolute inset-0 flex items-center justify-center bg-surface-variant/30 animate-pulse",
          "x-show": "!loaded",
          "x-transition:leave": "transition ease-out duration-200",
          "aria-hidden": "true",
          children: imageSkeletonIcon
        }
      ),
      /* @__PURE__ */ jsx(Link, { href, children: /* @__PURE__ */ jsx(
        "img",
        {
          src,
          alt,
          loading: "lazy",
          decoding: "async",
          class: "relative h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105",
          "x-bind:class": "!(aspectSquare && objectCover) ? objectFitClass + ' object-contain' : ''",
          "x-on:load": "onImageLoad()"
        }
      ) })
    ]
  }
);
const CardTitle = ({ children }) => /* @__PURE__ */ jsx("h3", { class: "text-balance font-display text-lg font-medium leading-snug text-on-surface-strong group-hover:underline decoration-accent decoration-1 underline-offset-4", children });
const CardSubTitle = ({ children, title }) => /* @__PURE__ */ jsx("span", { class: "text-sm font-medium", title, children });
const CardIntro = ({ children }) => /* @__PURE__ */ jsx("p", { class: "text-pretty text-sm text-on-surface-weak whitespace-pre-wrap", children });
const CardDescription = ({ children }) => /* @__PURE__ */ jsx("p", { class: "text-pretty text-sm text-on-surface whitespace-pre-wrap", children });
const CardText = ({ children }) => /* @__PURE__ */ jsx("span", { class: "text-xs text-on-surface whitespace-pre-wrap line-clamp-2", children });
const CardTags = ({ tags }) => {
  if (tags.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { class: "flex items-center flex-wrap gap-2", children: tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsx("span", { class: "w-fit inline-flex overflow-hidden border border-outline-strong bg-surface kicker text-on-surface-strong px-2.5 py-1", children: capitalize(tag) })) });
};
Card.Body = CardBody;
Card.Image = CardImage;
Card.Title = CardTitle;
Card.SubTitle = CardSubTitle;
Card.Description = CardDescription;
Card.Intro = CardIntro;
Card.Text = CardText;
Card.Tags = CardTags;
Card.Header = CardHeader;
var Card_default = Card;
export {
  Card_default as default
};
