import clsx from "clsx";
import { HORIZONTAL_SLIDER_CARD_CLASS } from "../../../lib/horizontalSliderCardWidth";

export type PromotedListCardData = {
  id: string;
  title: string;
  slug: string;
  bookCount: number;
  coverUrls: string[];
  owner: {
    displayName: string;
    shelfSlug: string;
  };
};

const PromotedListCard = ({
  list,
  widthClass = HORIZONTAL_SLIDER_CARD_CLASS,
}: {
  list: PromotedListCardData;
  widthClass?: string;
}) => {
  const href = `/shelf/${list.owner.shelfSlug}/lists/${list.slug}`;
  const covers = list.coverUrls.slice(0, 3);

  return (
    <a
      href={href}
      class={clsx(
        "relative block overflow-hidden rounded-radius border border-outline bg-surface-alt shrink-0",
        widthClass,
      )}
    >
      <div class="grid h-48 grid-cols-3 gap-0.5 bg-surface">
        {covers.length === 0 ? (
          <div class="col-span-3 flex items-center justify-center text-sm text-on-surface-weak">
            List
          </div>
        ) : (
          covers.map((url, i) => (
            <img
              src={url}
              alt=""
              class={clsx(
                "h-full w-full object-cover",
                covers.length === 1 && "col-span-3",
                covers.length === 2 && i === 0 && "col-span-2",
              )}
              loading="lazy"
              decoding="async"
            />
          ))
        )}
      </div>
      <div class="flex flex-col gap-1 p-4">
        <p class="kicker text-on-surface-weak">List</p>
        <h3 class="font-display text-xl font-medium text-on-surface-strong text-balance line-clamp-2">
          {list.title}
        </h3>
        <p class="text-sm text-on-surface">
          {list.owner.displayName}
          <span class="text-on-surface-weak">
            {" "}
            · {list.bookCount} {list.bookCount === 1 ? "book" : "books"}
          </span>
        </p>
      </div>
    </a>
  );
};

export default PromotedListCard;
