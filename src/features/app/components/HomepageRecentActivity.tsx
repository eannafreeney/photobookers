import {
  recentActivityTrailingText,
  type RecentActivityItem,
} from "../homepageRecentActivityUtils";

type Props = {
  items: RecentActivityItem[];
};

const HomepageRecentActivity = ({ items }: Props) => {
  if (items.length === 0) return null;

  return (
    <section
      // class="border-y border-outline py-4"
      aria-label="Recent community activity"
    >
      <p class="kicker text-accent mb-3 text-center">Live on Photobookers</p>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul class="mx-auto flex w-max max-w-full items-stretch gap-3 px-1">
          {items.map((item) => (
            <li key={item.id} class="list-none">
              <a
                href={item.targetUrl}
                class="flex max-w-xs items-center gap-3 rounded-radius border border-outline bg-surface px-3 py-2 shadow-sm transition hover:bg-surface-alt/60"
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  class="size-12 shrink-0 rounded object-cover"
                  loading="lazy"
                  width="48"
                  height="48"
                />
                <p class="min-w-0 text-sm text-on-surface">
                  <strong class="font-medium text-on-surface-strong">
                    {item.targetName}
                  </strong>
                  {item.targetCreatorName ? (
                    <span class="text-on-surface-weak">
                      {" "}
                      by {item.targetCreatorName}
                    </span>
                  ) : null}
                  <span>{recentActivityTrailingText(item.type)}</span>
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomepageRecentActivity;
