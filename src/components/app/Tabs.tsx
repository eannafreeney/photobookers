import { PropsWithChildren } from "hono/jsx";

type TabsProps = PropsWithChildren<{
  defaultTab: string;
  // Map of `window.location.hash` values to the tab that should open on load,
  // e.g. `{ "#book-images": "images" }`.
  hashMap?: Record<string, string>;
}>;
type TabPanelProps = PropsWithChildren<{ tabId: string }>;
type TabLinkContainerProps = PropsWithChildren<{
  align?: "center" | "left";
}>;
type TabLinkProps = PropsWithChildren<{
  tabId: string;
  disabled?: boolean;
  title?: string;
}>;

const Tabs = ({ defaultTab, hashMap, children }: TabsProps) => (
  <div
    x-data={`{ currentTab: '${defaultTab}' }`}
    x-init={
      hashMap
        ? `const t = (${JSON.stringify(hashMap)})[window.location.hash]; if (t) currentTab = t;`
        : undefined
    }
  >
    {children}
  </div>
);

const TabLinkContainer = ({
  align = "center",
  children,
}: TabLinkContainerProps) => (
  <div
    class={`flex items-center border-b border-outline gap-4 mb-2 mt-2 ${
      align === "left" ? "justify-start" : "justify-between mx-auto"
    }`}
  >
    {children}
  </div>
);

const TabLink = ({ tabId, disabled = false, title, children }: TabLinkProps) =>
  disabled ? (
    <button
      type="button"
      disabled
      title={title}
      class="flex items-center gap-2 border-b-2 border-transparent -mb-px py-2 kicker cursor-not-allowed text-on-surface-weak opacity-50"
    >
      {children}
    </button>
  ) : (
    <button
      type="button"
      class="flex items-center gap-2 border-b-2 border-transparent -mb-px py-2 kicker cursor-pointer transition-colors"
      x-bind:class={`currentTab === '${tabId}'
        ? 'text-on-surface-strong border-b-accent'
        : 'text-on-surface-weak hover:text-on-surface-strong'`}
      x-on:click={`currentTab = '${tabId}'`}
    >
      {children}
    </button>
  );

const TabPanel = ({ tabId, children }: TabPanelProps) => (
  <div
    x-show={`currentTab === '${tabId}'`}
    class="flex flex-col gap-4 mt-4"
    x-transition:enter="transition ease-out duration-600"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
  >
    {children}
  </div>
);

Tabs.LinkContainer = TabLinkContainer;
Tabs.Link = TabLink;
Tabs.Panel = TabPanel;

export default Tabs;
