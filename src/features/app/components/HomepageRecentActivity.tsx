import {
  formatRecentActivityAge,
  recentActivityTrailingText,
  serializeRecentActivityItems,
  type RecentActivityItem,
  type SerializedRecentActivityItem,
} from "../homepageRecentActivityUtils";

type Props = {
  items: RecentActivityItem[];
  currentUserId?: string | null;
  hasMore?: boolean;
  nextOffset?: number;
  pageSize?: number;
};

const RecentActivityCard = ({
  item,
  timeLabel,
}: {
  item: SerializedRecentActivityItem;
  timeLabel: string;
}) => (
  <li class="list-none shrink-0" data-recent-activity-ssr>
    <a
      href={item.targetUrl}
      class="flex flex-col gap-2 rounded-radius border border-outline bg-surface p-2 shadow-sm transition hover:bg-surface-alt/60"
    >
      <div class="flex h-36 w-36 items-center justify-center">
        <img
          src={item.imageUrl}
          alt=""
          class="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>
      <p class="w-36 min-w-0 text-xs leading-snug text-on-surface sm:text-sm">
        <strong class="font-medium text-on-surface-strong">
          {item.targetName}
        </strong>
        {item.targetCreatorName ? (
          <span class="text-on-surface-weak"> by {item.targetCreatorName}</span>
        ) : null}
        {recentActivityTrailingText(item.type)}
      </p>
      <time datetime={item.createdAt} class="text-[11px] text-on-surface-weak">
        {timeLabel}
      </time>
    </a>
  </li>
);

const HomepageRecentActivity = ({
  items,
  currentUserId,
  hasMore = false,
  nextOffset,
  pageSize = 10,
}: Props) => {
  if (items.length === 0) return null;

  const serialized = serializeRecentActivityItems(items);
  const bootstrap = JSON.stringify({
    items: serialized,
    currentUserId: currentUserId ?? null,
    hasMore,
    nextOffset: nextOffset ?? serialized.length,
    pageSize,
  });
  const now = Date.now();

  return (
    <section
      class="py-4"
      aria-label="Recent community activity"
      data-recent-activity={bootstrap}
      {...{
        "x-data": "homepageRecentActivity()",
        "x-on:beforeunload.window": "disconnect()",
      }}
    >
      <p class="kicker text-accent mb-3 text-center">Live on Photobookers</p>
      <div
        x-ref="strip"
        x-on:scroll="onStripScroll($event)"
        class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul class="mx-auto flex w-max items-start gap-3 px-1">
          {serialized.map((item) => (
            <RecentActivityCard
              key={item.id}
              item={item}
              timeLabel={formatRecentActivityAge(item.createdAt, now)}
            />
          ))}
          <template x-for="item in items" x-bind:key="item.id">
            <li class="list-none shrink-0">
              <a
                x-bind:href="item.targetUrl"
                class="flex flex-col gap-2 rounded-radius border border-outline bg-surface p-2 shadow-sm transition hover:bg-surface-alt/60"
              >
                <div class="flex h-36 w-36 items-center justify-center">
                  <img
                    x-bind:src="item.imageUrl"
                    alt=""
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p class="w-36 min-w-0 text-xs leading-snug text-on-surface sm:text-sm">
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
          <li
            x-show="loadingMore"
            x-cloak
            class="list-none flex h-36 w-16 shrink-0 items-center justify-center text-xs text-on-surface-weak"
          >
            Loading…
          </li>
        </ul>
      </div>
    </section>
  );
};

export default HomepageRecentActivity;
