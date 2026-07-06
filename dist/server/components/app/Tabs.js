import { jsx } from "hono/jsx/jsx-runtime";
const Tabs = ({ defaultTab, children }) => /* @__PURE__ */ jsx("div", { "x-data": `{ currentTab: '${defaultTab}' }`, children });
const TabLinkContainer = ({
  align = "center",
  children
}) => /* @__PURE__ */ jsx(
  "div",
  {
    class: `flex items-center border-b border-outline gap-4 mb-2 mt-2 ${align === "left" ? "justify-start" : "justify-between mx-auto"}`,
    children
  }
);
const TabLink = ({ tabId, children }) => /* @__PURE__ */ jsx(
  "button",
  {
    class: "flex items-center gap-2 border-b-2 border-transparent -mb-px py-2 kicker cursor-pointer transition-colors",
    "x-bind:class": `currentTab === '${tabId}'
        ? 'text-on-surface-strong border-b-accent'
        : 'text-on-surface-weak hover:text-on-surface-strong'`,
    "x-on:click": `currentTab = '${tabId}'`,
    children
  }
);
const TabPanel = ({ tabId, children }) => /* @__PURE__ */ jsx(
  "div",
  {
    "x-show": `currentTab === '${tabId}'`,
    class: "flex flex-col gap-4 mt-4",
    "x-transition:enter": "transition ease-out duration-600",
    "x-transition:enter-start": "opacity-0",
    "x-transition:enter-end": "opacity-100",
    children
  }
);
Tabs.LinkContainer = TabLinkContainer;
Tabs.Link = TabLink;
Tabs.Panel = TabPanel;
var Tabs_default = Tabs;
export {
  Tabs_default as default
};
