import { PropsWithChildren } from "hono/jsx";

type TabsProps = PropsWithChildren<{ defaultTab: string }>;
type TabPanelProps = PropsWithChildren<{ tabId: string }>;
type TabLinkContainerProps = PropsWithChildren<{}>;
type TabLinkProps = PropsWithChildren<{
  tabId: string;
}>;

const Tabs = ({ defaultTab, children }: TabsProps) => (
  <div x-data={`{ currentTab: '${defaultTab}' }`}>{children}</div>
);

const TabLinkContainer = ({ children }: TabLinkContainerProps) => (
  <div class="flex items-center justify-between bg-surface-alt gap-2 mb-2 mt-2 mx-auto">
    {children}
  </div>
);

const TabLink = ({ tabId, children }: TabLinkProps) => (
  <button
    class="flex items-center gap-2 border-b-2 border-transparent px-4 py-1 text-sm"
    x-bind:class={`currentTab === '${tabId}'
        ? 'font-bold text-primary border-b-2 border-b-primary'
        : 'text-on-surface font-medium hover:border-b-outline-strong hover:text-on-surface-strong'`}
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
