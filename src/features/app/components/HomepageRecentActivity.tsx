import {
  serializeRecentActivityItems,
  type RecentActivityItem,
} from "../homepageRecentActivityUtils";

type Props = {
  items: RecentActivityItem[];
  currentUserId?: string | null;
};

const HomepageRecentActivity = ({ items, currentUserId }: Props) => {
  const bootstrap = JSON.stringify({
    items: serializeRecentActivityItems(items),
    currentUserId: currentUserId ?? null,
  });

  const alpineAttrs = {
    "x-data": `homepageRecentActivity(${bootstrap})`,
    "x-init": "connect()",
    "x-on:beforeunload.window": "disconnect()",
    "x-show": "items.length > 0",
    "x-cloak": true,
  };

  return (
    <section aria-label="Recent community activity" {...alpineAttrs}>
      <p class="kicker text-accent mb-3 text-center">Live on Photobookers</p>
      <div
        x-ref="strip"
        class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul class="mx-auto flex w-max max-w-full items-stretch gap-3 px-1">
          <template x-for="item in items" x-bind:key="item.id">
            <li class="list-none">
              <a
                x-bind:href="item.targetUrl"
                x-bind:class="item.isNew ? 'flex max-w-xs items-center gap-3 rounded-radius border border-accent bg-surface px-3 py-2 shadow-sm ring-2 ring-accent/40 transition hover:bg-surface-alt/60' : 'flex max-w-xs items-center gap-3 rounded-radius border border-outline bg-surface px-3 py-2 shadow-sm transition hover:bg-surface-alt/60'"
              >
                <img
                  x-bind:src="item.imageUrl"
                  alt=""
                  class="size-12 shrink-0 rounded object-cover"
                  loading="lazy"
                  width="48"
                  height="48"
                />
                <p class="min-w-0 text-sm text-on-surface">
                  <strong
                    class="font-medium text-on-surface-strong"
                    x-text="item.targetName"
                  ></strong>
                  <template x-if="item.targetCreatorName">
                    <span class="text-on-surface-weak">
                      {" "}
                      by <span x-text="item.targetCreatorName"></span>
                    </span>
                  </template>
                  <span x-text="trailingText(item.type)"></span>
                </p>
              </a>
            </li>
          </template>
        </ul>
      </div>
    </section>
  );
};

export default HomepageRecentActivity;
