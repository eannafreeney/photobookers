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
  },
];

const SiteFeatures = () => {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mx-auto">
      {tickerItems.map((item) => (
        <FeatureCard key={item.title} item={item} />
      ))}
    </div>
  );
};

export default SiteFeatures;

const FeatureCard = ({
  item,
}: {
  item: { title: string; icon: ChildType };
}) => {
  return (
    <div class="bg-sky-100 rounded-radius p-4 flex items-center justify-start">
      <div class="w-full flex items-center gap-4 justify-start">
        <span class="w-6 h-6 flex items-center justify-center shrink-0">
          {item.icon}
        </span>
        <div class="text-md font-semibold text-on-surface-strong min-w-0">
          {item.title}
        </div>
      </div>
    </div>
  );
};
