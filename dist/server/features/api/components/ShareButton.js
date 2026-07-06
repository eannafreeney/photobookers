import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const shareButtonClass = "whitespace-nowrap w-full rounded-radius border border-secondary bg-transparent px-4 py-2 text-sm font-medium tracking-wide text-secondary transition hover:opacity-75 text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2";
const ShareButton = ({
  isCircleButton = false,
  title,
  text,
  url
}) => {
  const tooltipText = "Share";
  const shareConfig = JSON.stringify({ title, text, url });
  if (isCircleButton) {
    return /* @__PURE__ */ jsx("div", { "x-data": `shareButton(${shareConfig})`, children: /* @__PURE__ */ jsx(
      "button",
      {
        class: "inline-flex justify-center items-center aspect-square whitespace-nowrap rounded-full bg-gray-200 size-8 p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark active:opacity-100 active:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer",
        title: tooltipText,
        "x-on:click": "share()",
        children: shareIcon()
      }
    ) });
  }
  return /* @__PURE__ */ jsx("div", { "x-data": `shareButton(${shareConfig})`, class: "w-full", children: /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      title: tooltipText,
      class: `${shareButtonClass} flex items-center justify-center gap-2`,
      "x-on:click": "share()",
      children: [
        "Share ",
        shareIcon(4)
      ]
    }
  ) });
};
var ShareButton_default = ShareButton;
const shareIcon = (size = 4) => /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: `size-${size}`,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
      }
    )
  }
);
export {
  ShareButton_default as default
};
