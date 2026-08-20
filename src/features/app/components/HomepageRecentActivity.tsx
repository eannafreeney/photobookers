import {
  activityActorAvatarUrl,
  formatRecentActivityAge,
  recentActivityVerb,
  serializeRecentActivityItems,
  type RecentActivityItem,
  type SerializedRecentActivityItem,
} from "../homepageRecentActivityUtils";
import type { HomepageActivityStats } from "../homepageActivityVisibility";
import HomepageActivityPulse from "./HomepageActivityPulse";

type Props = {
  items: RecentActivityItem[];
  currentUserId?: string | null;
  hasMore?: boolean;
  nextOffset?: number;
  pageSize?: number;
  /** Weekly view counts, shown alongside the live feed. */
  stats?: HomepageActivityStats | null;
};

const CARD_CLASS =
  "flex h-full w-28 flex-col items-center gap-2 rounded-radius border border-outline bg-surface p-2 shadow-sm transition hover:bg-surface-alt/60";
const COVER_WRAP_CLASS = "relative flex h-24 w-full items-center justify-center";
const COVER_CLASS = "max-h-full max-w-full object-contain";
const AVATAR_CLASS =
  "absolute -bottom-1 -left-1 size-7 rounded-full object-cover ring-2 ring-surface bg-surface-alt";
const CAPTION_CLASS =
  "w-full min-w-0 flex-1 text-xs leading-snug text-on-surface text-center";
const TIME_CLASS = "text-[11px] text-on-surface-weak";

/** Pulsing dot; solid once the event stream is connected. */
const LiveDot = () => (
  <span class="relative flex size-2 shrink-0" aria-hidden="true">
    <span
      x-show="connected"
      x-cloak
      class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"
    ></span>
    <span class="relative inline-flex size-2 rounded-full bg-accent"></span>
  </span>
);

const RecentActivityCard = ({
  item,
  timeLabel,
}: {
  item: SerializedRecentActivityItem;
  timeLabel: string;
}) => (
  <li class="list-none shrink-0" data-recent-activity-ssr>
    <a href={item.targetUrl} class={CARD_CLASS}>
      <div class={COVER_WRAP_CLASS}>
        <img src={item.imageUrl} alt="" class={COVER_CLASS} loading="lazy" />
        <img
          src={activityActorAvatarUrl(item)}
          alt=""
          class={AVATAR_CLASS}
          loading="lazy"
        />
      </div>
      <p class={CAPTION_CLASS}>
        <strong class="font-medium text-on-surface-strong">
          {item.targetName}
        </strong>{" "}
        was {recentActivityVerb(item.type)} by{" "}
        <strong class="font-medium text-on-surface-strong">
          {item.actorName}
        </strong>
      </p>
      <time datetime={item.createdAt} class={TIME_CLASS}>
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
  stats,
}: Props) => {
  if (items.length === 0 && !stats) return null;

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
      <div class="mb-6 flex flex-col items-center gap-1 border-t-2 border-on-surface-strong pt-3">
        <span class="kicker text-accent live-label inline-flex items-center gap-2">
          <LiveDot />
          Live on Photobookers
        </span>
        {stats ? (
          <HomepageActivityPulse
            bookViews={stats.bookViews}
            profileViews={stats.profileViews}
            className="text-xs text-on-surface-weak text-pretty text-center"
          />
        ) : null}
      </div>

      {serialized.length === 0 ? null : (
        <div
          x-ref="strip"
          x-on:scroll="onStripScroll($event)"
          class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul class="mx-auto flex w-max items-stretch gap-3 px-1 py-1">
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
                  class={CARD_CLASS}
                  x-bind:class="item.isNew ? 'activity-card-new' : ''"
                >
                  <div class={COVER_WRAP_CLASS}>
                    <img
                      x-bind:src="item.imageUrl"
                      alt=""
                      class={COVER_CLASS}
                      loading="lazy"
                    />
                    <img
                      x-bind:src="avatar(item)"
                      alt=""
                      class={AVATAR_CLASS}
                      loading="lazy"
                    />
                  </div>
                  <p class={CAPTION_CLASS}>
                    <strong
                      class="font-medium text-on-surface-strong"
                      x-text="item.targetName"
                    ></strong>{" "}
                    was <span x-text="verb(item.type)"></span> by{" "}
                    <strong
                      class="font-medium text-on-surface-strong"
                      x-text="item.actorName"
                    ></strong>
                  </p>
                  <time
                    x-bind:datetime="item.createdAt"
                    class={TIME_CLASS}
                    x-text="timeAgo(item.createdAt)"
                  ></time>
                </a>
              </li>
            </template>
            <li
              x-show="loadingMore"
              x-cloak
              class="list-none flex h-28 w-16 shrink-0 items-center justify-center text-xs text-on-surface-weak"
            >
              Loading…
            </li>
          </ul>
        </div>
      )}
    </section>
  );
};

export default HomepageRecentActivity;
