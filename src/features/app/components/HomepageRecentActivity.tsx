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
    "x-data": "homepageRecentActivity()",
    "x-init": "init()",
    "x-on:beforeunload.window": "disconnect()",
    "x-show": "items.length > 0",
    "x-cloak": true,
  };

  return (
    <section
      aria-label="Recent community activity"
      data-recent-activity={bootstrap}
      {...alpineAttrs}
    >
      <p class="kicker text-accent mb-3 text-center">Live on Photobookers</p>
      <div
        x-ref="strip"
        class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul class="mx-auto flex w-max items-start gap-3 px-1">
          <template x-for="item in items" x-bind:key="item.id">
            <li class="list-none shrink-0">
              <a
                x-bind:href="item.targetUrl"
                class="flex flex-col items-center gap-2 rounded-radius border border-outline bg-surface p-2 shadow-sm transition hover:bg-surface-alt/60"
              >
                <div class="flex h-28 w-28 items-center justify-center">
                  <img
                    x-bind:src="item.imageUrl"
                    alt=""
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p class="w-28 min-w-0 text-xs leading-snug text-on-surface sm:text-sm">
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
                <time
                  x-bind:datetime="item.createdAt"
                  class="text-[11px] text-on-surface-weak"
                  x-text="timeAgo(item.createdAt)"
                ></time>
              </a>
            </li>
          </template>
        </ul>
      </div>
    </section>
  );
};

export default HomepageRecentActivity;
