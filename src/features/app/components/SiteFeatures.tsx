import {
  editIcon,
  emptyHeartIcon,
  libraryIcon,
  mailIcon,
  thumbsUpIcon,
  usersIcon,
} from "../../../lib/icons";
import type { ChildType } from "../../../../types";

export const tickerItems = [
  {
    title: "Follow your favorite artists and publishers",
    icon: usersIcon(5),
  },
  {
    title: "Show some love to your favorite books with a 'like'",
    icon: thumbsUpIcon(5),
  },
  {
    title: "Add your favorite books to your collection",
    icon: libraryIcon(5),
  },
  {
    title: "Wishlist your favorite books",
    icon: emptyHeartIcon(5),
  },
  {
    title: "Share what you loved about a book",
    icon: editIcon(5),
  },
  {
    title: "Join the Newsletter and be updated about new books",
    icon: mailIcon(5),
    href: "/newsletter",
  },
];

const SiteFeatures = () => {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 mx-auto w-full">
      {tickerItems.map((item, index) => (
        <FeatureCard key={item.title} item={item} index={index} />
      ))}
    </div>
  );
};

export default SiteFeatures;

const FeatureCard = ({
  item,
  index,
}: {
  item: { title: string; icon: ChildType; href?: string };
  index: number;
}) => {
  const content = (
    <div class="text-sm font-medium text-on-surface-strong min-w-0 text-pretty">
      {item.title}
    </div>
  );

  return (
    <div class="border-t-2 border-on-surface-strong pt-3 flex items-start gap-4">
      <span class="kicker text-accent shrink-0 pt-1">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-5 h-5 flex items-center justify-center shrink-0 text-on-surface-strong">
          {item.icon}
        </span>
        {item.href ? (
          <a
            href={item.href}
            class="hover:underline decoration-accent underline-offset-4"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
};
